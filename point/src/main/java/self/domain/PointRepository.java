package self.domain;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
public class PointRepository {

    private static final String COLLECTION_NAME = "points";

    @Autowired
    private Firestore firestore;

    public Point save(Point point) throws ExecutionException, InterruptedException {
        if (point.getId() == null || point.getId().isEmpty()) {
            // Create new document
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document();
            point.setId(docRef.getId());
        }
        firestore.collection(COLLECTION_NAME).document(point.getId()).set(point).get();
        return point;
    }

    public Optional<Point> findById(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        if (document.exists()) {
            return Optional.ofNullable(document.toObject(Point.class));
        }
        return Optional.empty();
    }

    public Optional<Point> findByUserId(String userId) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("userId", userId)
                .limit(1) // userId는 고유해야 하므로 1개만 가져옴
                .get();
        
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        if (!documents.isEmpty()) {
            return Optional.ofNullable(documents.get(0).toObject(Point.class));
        }
        return Optional.empty();
    }

    public void deleteById(String id) {
        firestore.collection(COLLECTION_NAME).document(id).delete();
    }
}
