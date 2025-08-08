package self.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.stereotype.Service;
import self.domain.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Service
public class TermService {

    @Autowired
    private TermRepository termRepository;

    // Kafka를 사용하지 않으므로 StreamBridge는 주석 처리 또는 삭제합니다.
    // @Autowired
    // private StreamBridge streamBridge;

    public Term createTerm(Term term) throws ExecutionException, InterruptedException {
        term.setCreatedAt(new Date());
        return this.save(term);
    }

    public Optional<Term> findById(String id) throws ExecutionException, InterruptedException {
        return termRepository.findById(id);
    }

    public List<Term> findAllByUserId(String userId) throws ExecutionException, InterruptedException {
        return termRepository.findByUserId(userId);
    }

    public Term save(Term term) throws ExecutionException, InterruptedException {
        // DB에 저장하는 로직만 남깁니다.
        termRepository.save(term);
        
        // Kafka 이벤트 발행 로직은 모두 제거합니다.
        
        return term;
    }

    // PolicyHandler에서 사용하던 메소드들은 Kafka를 사용하지 않으므로,
    // 현재 아키텍처에서는 직접 호출되지 않습니다. 그대로 두거나 삭제할 수 있습니다.
    public void registerTerm(TermCreated event) throws ExecutionException, InterruptedException {
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
        termRepository.findById(event.getTermId().toString()).ifPresent(originalTerm -> {
            Term newForeignTerm = new Term();
            newForeignTerm.setUserId(originalTerm.getUserId());
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