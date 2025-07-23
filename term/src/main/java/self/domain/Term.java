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
import self.domain.AiTermModifyRequested;
import self.domain.ForeignTermCreateRequested;
import self.domain.RiskDetectRequested;
import self.domain.TermCreateRequested;
import self.domain.TermModified;
import self.domain.TermRegistered;
import self.domain.TermReviewRequested;
import self.domain.VisualizationRequested;

@Entity
@Table(name = "Term_table")
@Data
//<<< DDD / Aggregate Root
public class Term {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Long userId;

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

    @PostPersist
    public void onPostPersist() {
        TermCreateRequested termCreateRequested = new TermCreateRequested(this);
        termCreateRequested.publishAfterCommit();

        ForeignTermCreateRequested foreignTermCreateRequested = new ForeignTermCreateRequested(
            this
        );
        foreignTermCreateRequested.publishAfterCommit();

        TermRegistered termRegistered = new TermRegistered(this);
        termRegistered.publishAfterCommit();

        RiskDetectRequested riskDetectRequested = new RiskDetectRequested(this);
        riskDetectRequested.publishAfterCommit();

        VisualizationRequested visualizationRequested = new VisualizationRequested(
            this
        );
        visualizationRequested.publishAfterCommit();

        TermReviewRequested termReviewRequested = new TermReviewRequested(this);
        termReviewRequested.publishAfterCommit();
    }

    @PostUpdate
    public void onPostUpdate() {
        TermModified termModified = new TermModified(this);
        termModified.publishAfterCommit();

        AiTermModifyRequested aiTermModifyRequested = new AiTermModifyRequested(
            this
        );
        aiTermModifyRequested.publishAfterCommit();
    }

    public static TermRepository repository() {
        TermRepository termRepository = TermApplication.applicationContext.getBean(
            TermRepository.class
        );
        return termRepository;
    }

    //<<< Clean Arch / Port Method
    public static void registerTerm(TermCreated termCreated) {
        //implement business logic here:

        /** Example 1:  new item 
        Term term = new Term();
        repository().save(term);

        TermRegistered termRegistered = new TermRegistered(term);
        termRegistered.publishAfterCommit();
        */

        /** Example 2:  finding and process
        
        // if termCreated.llmId exists, use it
        
        // ObjectMapper mapper = new ObjectMapper();
        // Map<, Object> aiMap = mapper.convertValue(termCreated.getLlmId(), Map.class);

        repository().findById(termCreated.get???()).ifPresent(term->{
            
            term // do something
            repository().save(term);

            TermRegistered termRegistered = new TermRegistered(term);
            termRegistered.publishAfterCommit();

         });
        */

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
        //implement business logic here:

        /** Example 1:  new item 
        Term term = new Term();
        repository().save(term);

        */

        /** Example 2:  finding and process
        
        // if aiTermModified.llmId exists, use it
        
        // ObjectMapper mapper = new ObjectMapper();
        // Map<, Object> aiMap = mapper.convertValue(aiTermModified.getLlmId(), Map.class);

        repository().findById(aiTermModified.get???()).ifPresent(term->{
            
            term // do something
            repository().save(term);


         });
        */

    }
    //>>> Clean Arch / Port Method

}
//>>> DDD / Aggregate Root
