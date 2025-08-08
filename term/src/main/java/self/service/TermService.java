package self.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;
import self.domain.*;

import java.util.Date; // import 추가
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Service
public class TermService {

    @Autowired
    private TermRepository termRepository;

    @Autowired
    private StreamBridge streamBridge;

    // TermController에서 사용할 메소드들
    public Term createTerm(Term term) throws ExecutionException, InterruptedException {
        // 생성 시에는 항상 "v1"이므로, 별도의 updateType은 없음
        term.setCreatedAt(new Date()); // 생성 시간 설정
        // save 메소드를 호출하여 저장 및 이벤트 발행
        return this.save(term);
    }

    public Optional<Term> findById(String id) throws ExecutionException, InterruptedException {
        return termRepository.findById(id);
    }

    public List<Term> findAllByUserId(String userId) throws ExecutionException, InterruptedException {
        return termRepository.findByUserId(userId);
    }

    public Term save(Term term) throws ExecutionException, InterruptedException {
        termRepository.save(term);

        // AI가 직접 생성한 초안의 경우, 별도의 이벤트를 발행하지 않음
        if ("AI_DRAFT".equals(term.getTermType())) {
            return term;
        }

        // updateType에 따라 적절한 이벤트 발행
        String updateType = term.getUpdateType();
        if ("v1".equals(term.getVersion()) && updateType == null) {
             TermCreateRequested termCreateRequested = new TermCreateRequested(term);
             // 헤더와 함께 메시지 전송
             Message<TermCreateRequested> message = MessageBuilder
                     .withPayload(termCreateRequested)
                     .setHeader("type", "TermCreateRequested")
                     .build();
             streamBridge.send("event-out", message);
        } else if ("AI_MODIFY".equals(updateType)) {
            TermModified termModified = new TermModified(term);
            Message<TermModified> message = MessageBuilder
                    .withPayload(termModified)
                    .setHeader("type", "TermModified")
                    .build();
            streamBridge.send("event-out", message);
        } else if ("DIRECT_UPDATE".equals(updateType)) {
            TermModified termModified = new TermModified(term);
            Message<TermModified> message = MessageBuilder
                    .withPayload(termModified)
                    .setHeader("type", "TermModified")
                    .build();
            streamBridge.send("event-out", message);
        } else {
            // 그 외의 경우, 또는 updateType이 없는 경우 일반적인 등록 이벤트 발행
            TermRegistered termRegistered = new TermRegistered(term);
            Message<TermRegistered> message = MessageBuilder
                    .withPayload(termRegistered)
                    .setHeader("type", "TermRegistered")
                    .build();
            streamBridge.send("event-out", message);
        }

        return term;
    }

    // PolicyHandler에서 사용할 메소드들
    public void registerTerm(TermCreated event) throws ExecutionException, InterruptedException {
        // Term.registerTerm(TermCreated) 로직을 여기에 구현
        termRepository.findById(event.getTermId().toString()).ifPresent(term->{
            term.setRisk(event.getTermRisk());
            term.setFeedback(event.getTermFeedback());
            try {
                termRepository.save(term);
            } catch (ExecutionException | InterruptedException e) {
                throw new RuntimeException(e);
            }
        });
    }

    public void registerTerm(ForeignTermCreated event) throws ExecutionException, InterruptedException {
        // Term.registerTerm(ForeignTermCreated) 로직을 여기에 구현
        termRepository.findById(event.getTermId().toString()).ifPresent(originalTerm -> {
            Term newForeignTerm = new Term();
            newForeignTerm.setUserId(originalTerm.getUserId());
            // ... (나머지 필드 복사)
            newForeignTerm.setTitle(event.getTermTile());
            newForeignTerm.setContent(event.getTermContent());
            newForeignTerm.setVersion("v1");
            newForeignTerm.setOrigin(originalTerm.getId());
            try {
                termRepository.save(newForeignTerm);
            } catch (ExecutionException | InterruptedException e) {
                throw new RuntimeException(e);
            }
        });
    }
    
    public void saveModifiedTerm(AiTermModified event) throws ExecutionException, InterruptedException {
        // Term.saveModifiedTerm(AiTermModified) 로직을 여기에 구현
        termRepository.findById(event.getTermId().toString()).ifPresent(originalTerm -> {
            Term newVersionTerm = createNewVersionFrom(originalTerm);
            newVersionTerm.setContent(event.getTermContent());
            newVersionTerm.setUpdateType("AI_MODIFY");
            try {
                termRepository.save(newVersionTerm);
            } catch (ExecutionException | InterruptedException e) {
                throw new RuntimeException(e);
            }
        });
    }

    // Term.createNewVersionFrom 헬퍼 메소드
    public Term createNewVersionFrom(Term originalTerm) {
        if (originalTerm == null) {
            throw new IllegalArgumentException("Original term cannot be null");
        }
        Term newVersionTerm = new Term();
        newVersionTerm.setUserId(originalTerm.getUserId());
        newVersionTerm.setTitle(originalTerm.getTitle());
        newVersionTerm.setContent(originalTerm.getContent());
        newVersionTerm.setCategory(originalTerm.getCategory());
        newVersionTerm.setProductName(originalTerm.getProductName());
        newVersionTerm.setRequirement(originalTerm.getRequirement());
        newVersionTerm.setUserCompany(originalTerm.getUserCompany());
        newVersionTerm.setClient(originalTerm.getClient());
        newVersionTerm.setCreatedAt(originalTerm.getCreatedAt());
        
        int currentVersion = Integer.parseInt(originalTerm.getVersion().replace("v", ""));
        newVersionTerm.setVersion("v" + (currentVersion + 1));
        newVersionTerm.setOrigin(originalTerm.getId());

        return newVersionTerm;
    }
}
