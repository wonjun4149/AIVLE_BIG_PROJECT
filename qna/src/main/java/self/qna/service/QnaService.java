package self.qna.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import self.qna.domain.Answer;
import self.qna.domain.PagedResponse;
import self.qna.domain.Question;
import self.qna.domain.QuestionDto;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class QnaService {

    public static final String COLLECTION_NAME = "questions";

    // ... (기존 메소드들은 대부분 유지) ...
    public String createQuestion(QuestionDto questionDto, String uid) throws ExecutionException, InterruptedException, FirebaseAuthException {
        UserRecord userRecord = FirebaseAuth.getInstance().getUser(uid);
        String authorName = userRecord.getDisplayName();
        if (authorName == null || authorName.isEmpty()) {
            authorName = "Anonymous";
        }

        Question question = new Question();
        question.setId(UUID.randomUUID().toString());
        question.setTitle(questionDto.getTitle());
        question.setContent(questionDto.getContent());
        question.setImageUrl(questionDto.getImageUrl()); // imageUrl 설정 추가
        question.setAuthorId(uid);
        question.setAuthorName(authorName);
        question.setCreatedAt(new Date());
        question.setUpdatedAt(new Date());
        question.setViewCount(0); // 조회수 0으로 초기화
        question.setAnswers(new ArrayList<>()); // Initialize with empty list

        Firestore dbFirestore = FirestoreClient.getFirestore();
        dbFirestore.collection(COLLECTION_NAME).document(question.getId()).set(question).get();
        return question.getId();
    }

    public PagedResponse<Question> getAllQuestions(int page, int size) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        
        // 1. 전체 게시글 수 카운트
        ApiFuture<QuerySnapshot> countFuture = dbFirestore.collection(COLLECTION_NAME).get();
        long totalElements = countFuture.get().size();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        // 2. 해당 페이지 데이터 조회 (정렬, 페이징)
        ApiFuture<QuerySnapshot> dataFuture = dbFirestore.collection(COLLECTION_NAME)
                .orderBy("createdAt", com.google.cloud.firestore.Query.Direction.DESCENDING)
                .offset(page * size)
                .limit(size)
                .get();
        
        List<QueryDocumentSnapshot> documents = dataFuture.get().getDocuments();
        List<Question> questions = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            questions.add(document.toObject(Question.class));
        }

        // 3. PagedResponse 객체로 감싸서 반환
        PagedResponse<Question> response = new PagedResponse<>();
        response.setContent(questions);
        response.setPageNumber(page);
        response.setPageSize(size);
        response.setTotalElements(totalElements);
        response.setTotalPages(totalPages);
        response.setLast(page >= totalPages - 1);

        return response;
    }

    public Question getQuestionById(String id, String uid) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference documentReference = dbFirestore.collection(COLLECTION_NAME).document(id);
        DocumentSnapshot documentSnapshot = documentReference.get().get();

        if (documentSnapshot.exists()) {
            Question question = documentSnapshot.toObject(Question.class);

            // 작성자가 아니고, 로그인한 사용자일 경우에만 조회수 증가
            boolean shouldIncreaseView = uid != null && !uid.equals(question.getAuthorId());
            if (shouldIncreaseView) {
                documentReference.update("viewCount", FieldValue.increment(1));
                // 화면에 바로 반영되도록 객체의 조회수도 1 증가시켜서 리턴
                question.setViewCount(question.getViewCount() + 1);
            }
            
            return question;
        }
        return null;
    }

    public void deleteQuestion(String id, String uid) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference documentReference = dbFirestore.collection(COLLECTION_NAME).document(id);
        DocumentSnapshot documentSnapshot = documentReference.get().get();

        if (!documentSnapshot.exists()) {
            throw new RuntimeException("Question not found with id: " + id);
        }

        Question question = documentSnapshot.toObject(Question.class);
        if (question == null || !question.getAuthorId().equals(uid)) {
            throw new SecurityException("User is not authorized to delete this question.");
        }

        // Storage에서 이미지 파일 삭제 (만약 있다면)
        if (question.getImageUrl() != null && !question.getImageUrl().isEmpty()) {
            deleteImageFromStorage(question.getImageUrl());
        }

        documentReference.delete();
    }

    public Answer createAnswer(String questionId, String content, String uid) throws FirebaseAuthException {
        UserRecord userRecord = FirebaseAuth.getInstance().getUser(uid);
        String authorName = userRecord.getDisplayName() != null ? userRecord.getDisplayName() : "Anonymous";

        Answer answer = new Answer();
        answer.setId(UUID.randomUUID().toString());
        answer.setContent(content);
        answer.setAuthorId(uid);
        answer.setAuthorName(authorName);
        answer.setCreatedAt(new Date());

        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference questionRef = dbFirestore.collection(COLLECTION_NAME).document(questionId);

        questionRef.update("answers", FieldValue.arrayUnion(answer));

        return answer;
    }

    public void updateQuestion(String id, QuestionDto questionDto, String uid) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference documentReference = dbFirestore.collection(COLLECTION_NAME).document(id);
        DocumentSnapshot documentSnapshot = documentReference.get().get();

        if (!documentSnapshot.exists()) {
            throw new RuntimeException("Question not found with id: " + id);
        }

        Question existingQuestion = documentSnapshot.toObject(Question.class);
        if (existingQuestion == null || !existingQuestion.getAuthorId().equals(uid)) {
            throw new SecurityException("User is not authorized to update this question.");
        }

        // 이미지 삭제 로직: 요청된 imageUrl이 비어있고, 기존 imageUrl은 존재할 때
        boolean isImageDeleted = (questionDto.getImageUrl() == null || questionDto.getImageUrl().isEmpty()) 
                                && (existingQuestion.getImageUrl() != null && !existingQuestion.getImageUrl().isEmpty());

        if (isImageDeleted) {
            deleteImageFromStorage(existingQuestion.getImageUrl());
        }

        // Firestore 문서 업데이트
        Map<String, Object> updates = new HashMap<>();
        updates.put("title", questionDto.getTitle());
        updates.put("content", questionDto.getContent());
        updates.put("updatedAt", new Date());
        updates.put("imageUrl", questionDto.getImageUrl()); // 새 URL 또는 null

        documentReference.update(updates);
    }

    private void deleteImageFromStorage(String imageUrl) {
        try {
            Bucket bucket = StorageClient.getInstance().bucket();
            // URL에서 파일 경로(object name)를 올바르게 추출하도록 수정
            // "https://storage.googleapis.com/BUCKET_NAME/" 부분을 제거
            String bucketName = bucket.getName();
            String prefix = "https://storage.googleapis.com/" + bucketName + "/";
            if (!imageUrl.startsWith(prefix)) {
                // 예상치 못한 URL 형식일 경우 처리 (예: Firebase의 다른 URL 형식)
                String objectName = imageUrl.split("/o/")[1].split("\\?")[0];
                objectName = URLDecoder.decode(objectName, StandardCharsets.UTF_8);
                bucket.get(objectName).delete();
                return;
            }
            String objectName = imageUrl.substring(prefix.length());
            
            Blob blob = bucket.get(objectName);
            if (blob != null) {
                blob.delete();
            }
        } catch (Exception e) {
            // 오류 발생 시 전체 로그를 출력하도록 변경
            e.printStackTrace();
        }
    }

    public String uploadImage(MultipartFile file, String uid) throws IOException, FirebaseAuthException {
        // 인증된 사용자인지 확인
        if (uid == null || uid.isEmpty()) {
            throw new SecurityException("User must be authenticated to upload images.");
        }

        Bucket bucket = StorageClient.getInstance().bucket();
        String fileName = "qna-images/" + uid + "/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        
        try (InputStream content = file.getInputStream()) {
            Blob blob = bucket.create(fileName, content, file.getContentType());
            // 파일을 공개적으로 읽을 수 있도록 설정
            blob.createAcl(com.google.cloud.storage.Acl.of(com.google.cloud.storage.Acl.User.ofAllUsers(), com.google.cloud.storage.Acl.Role.READER));
            // 공개 URL 반환
            return String.format("https://storage.googleapis.com/%s/%s", bucket.getName(), fileName);
        }
    }
}