package self.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import self.TermApplication;
import self.domain.TermCreateRequested;
import self.domain.TermModified;
import self.domain.TermRegistered;

@Entity
@Table(name = "Term_table")
@Data
//<<< DDD / Aggregate Root
public class Term {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String userId;

    private String title;

    private String category;

    private String productName;

    private String content;

    private String requirement;

    private String version;

    private String memo;

    private String origin;

    private Date createdAt;

    private Date modifiedAt;

    private Date expiresAt;

    private String risk;

    private String feedback;

    private String client;

    private String userCompany;

    private String langCode;

    private String updateType;

    @PostPersist
    public void onPostPersist() {
        if ("v1".equals(this.version)) {
            // This is a new term creation
            this.createdAt = new Date();
            TermCreateRequested termCreateRequested = new TermCreateRequested(this);
            termCreateRequested.publishAfterCommit();
        } else {
            // This is a new version from modification
            this.modifiedAt = new Date();
            if ("DIRECT_UPDATE".equals(this.updateType)) {
                TermModified termModified = new TermModified(this);
                termModified.publishAfterCommit();
            }
        }

        // Always publish registered event for any new term row
        TermRegistered termRegistered = new TermRegistered(this);
        termRegistered.publishAfterCommit();
    }

    @PostUpdate
    public void onPostUpdate() {
        // This method is no longer used for versioning, 
        // as all modifications create a new entity (persist).
        // Kept for potential other update scenarios.
    }

    public static TermRepository repository() {
        TermRepository termRepository = TermApplication.applicationContext.getBean(
            TermRepository.class
        );
        return termRepository;
    }

    //<<< Clean Arch / Port Method
    public void foreinTermCreateRequest(
        ForeinTermCreateRequestCommand foreinTermCreateRequestCommand
    ) {
        //implement business logic here:

        ForeignTermCreateRequested foreignTermCreateRequested = new ForeignTermCreateRequested(
            this
        );
        foreignTermCreateRequested.publishAfterCommit();
    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public void riskDectectRequest(
        RiskDectectRequestCommand riskDectectRequestCommand
    ) {
        //implement business logic here:

        RiskDetectRequested riskDetectRequested = new RiskDetectRequested(this);
        riskDetectRequested.publishAfterCommit();
    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public void termReviewRequest(
        TermReviewRequestCommand termReviewRequestCommand
    ) {
        //implement business logic here:

        TermReviewRequested termReviewRequested = new TermReviewRequested(this);
        termReviewRequested.publishAfterCommit();
    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public void aiTermModifyRequest(
        AiTermModifyRequestCommand aiTermModifyRequestCommand
    ) {
        //implement business logic here:

        AiTermModifyRequested aiTermModifyRequested = new AiTermModifyRequested(
            this
        );
        aiTermModifyRequested.publishAfterCommit();
    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public void visualizationRequest(
        VisualizationRequestCommand visualizationRequestCommand
    ) {
        //implement business logic here:

        VisualizationRequested visualizationRequested = new VisualizationRequested(
            this
        );
        visualizationRequested.publishAfterCommit();
    }

    //>>> Clean Arch / Port Method

    //<<< Clean Arch / Port Method
    public static void registerTerm(TermCreated termCreated) {
        // TermCreated 이벤트는 AI 서비스가 분석을 마친 후 발행합니다.
        // 이벤트에 포함된 termId를 사용하여 원본 약관을 찾습니다.
        repository().findById(termCreated.getTermId()).ifPresent(term->{
            
            // AI가 분석한 위험도와 피드백 정보로 약관 내용을 업데이트합니다.
            term.setRisk(termCreated.getTermRisk());
            term.setFeedback(termCreated.getTermFeedback());
            
            // 업데이트된 약관 정보를 데이터베이스에 저장합니다.
            // 이 때는 새로운 행을 추가하는 것이 아니라, 기존 행을 수정하는 것입니다.
            repository().save(term);

         });
    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public static void registerTerm(ForeignTermCreated foreignTermCreated) {
        //implement business logic here:

        /** Example 1:  new item 
        Term term = new Term();
        repository().save(term);

        TermRegistered termRegistered = new TermRegistered(term);
        termRegistered.publishAfterCommit();
        */

        /** Example 2:  finding and process
        
        // if foreignTermCreated.llmId exists, use it
        
        // ObjectMapper mapper = new ObjectMapper();
        // Map<, Object> aiMap = mapper.convertValue(foreignTermCreated.getLlmId(), Map.class);

        repository().findById(foreignTermCreated.get???()).ifPresent(term->{
            
            term // do something
            repository().save(term);

            TermRegistered termRegistered = new TermRegistered(term);
            termRegistered.publishAfterCommit();

         });
        */

    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public static void saveAnalysis(RistDetected ristDetected) {
        //implement business logic here:

        /** Example 1:  new item 
        Term term = new Term();
        repository().save(term);

        */

        /** Example 2:  finding and process
        
        // if ristDetected.llmId exists, use it
        
        // ObjectMapper mapper = new ObjectMapper();
        // Map<, Object> aiMap = mapper.convertValue(ristDetected.getLlmId(), Map.class);

        repository().findById(ristDetected.get???()).ifPresent(term->{
            
            term // do something
            repository().save(term);


         });
        */

    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public static void saveAnalysis(TermReviewed termReviewed) {
        //implement business logic here:

        /** Example 1:  new item 
        Term term = new Term();
        repository().save(term);

        */

        /** Example 2:  finding and process
        
        // if termReviewed.llmId exists, use it
        
        // ObjectMapper mapper = new ObjectMapper();
        // Map<, Object> aiMap = mapper.convertValue(termReviewed.getLlmId(), Map.class);

        repository().findById(termReviewed.get???()).ifPresent(term->{
            
            term // do something
            repository().save(term);


         });
        */

    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public static void saveModifiedTerm(AiTermModified aiTermModified) {
        // AI 수정 이벤트에서 원본 약관 ID를 가져와 해당 약관을 찾습니다.
        // AI 수정 이벤트는 수정된 약관의 ID가 아닌, 원본 약관의 ID를 가지고 있어야 합니다.
        // AiTermModified 이벤트에 termId 필드가 원본 약관의 ID를 담고 있다고 가정합니다.
        repository().findById(aiTermModified.getTermId()).ifPresent(originalTerm->{
            
            // 원본 약관을 기반으로 새로운 버전의 약관 객체를 생성합니다.
            Term newVersionTerm = createNewVersionFrom(originalTerm);

            // AI에 의해 수정된 내용을 새로운 버전의 약관에 설정합니다.
            newVersionTerm.setContent(aiTermModified.getTermContent());
            // 이 업데이트가 AI에 의한 수정임을 명시합니다.
            newVersionTerm.setUpdateType("AI_MODIFY");

            // 새로운 버전의 약관을 데이터베이스에 저장합니다.
            // 이 저장 과정에서 onPostPersist가 호출되어 modifiedAt이 설정됩니다.
            repository().save(newVersionTerm);

         });
    }
    //>>> Clean Arch / Port Method

    public static Term createNewVersionFrom(Term originalTerm) {
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
        
        // Set version and origin
        int currentVersion = Integer.parseInt(originalTerm.getVersion().replace("v", ""));
        newVersionTerm.setVersion("v" + (currentVersion + 1));
        newVersionTerm.setOrigin(String.valueOf(originalTerm.getId()));

        return newVersionTerm;
    }

}
//>>> DDD / Aggregate Root
