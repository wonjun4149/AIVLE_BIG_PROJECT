package self.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import self.AiApplication;
import self.domain.AiTermModified;
import self.domain.ForeignTermCreated;
import self.domain.RistDetected;
import self.domain.TermCreated;
import self.domain.TermReviewed;
import self.domain.TermVisualized;

@Entity
@Table(name = "Ai_table")
@Data
//<<< DDD / Aggregate Root
public class Ai {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Long termId;

    private String termTile;

    private String termCategory;

    private String termProductName;

    private String termContent;

    private Long termVersion;

    private String termRequirement;

    private String termRisk;

    public static AiRepository repository() {
        AiRepository aiRepository = AiApplication.applicationContext.getBean(
            AiRepository.class
        );
        return aiRepository;
    }

    //<<< Clean Arch / Port Method
    public static void createForeignDraft(
        ForeignTermCreateRequested foreignTermCreateRequested
    ) {
        //implement business logic here:

        /** Example 1:  new item 
        Ai ai = new Ai();
        repository().save(ai);

        ForeignTermCreated foreignTermCreated = new ForeignTermCreated(ai);
        foreignTermCreated.publishAfterCommit();
        */

        /** Example 2:  finding and process
        

        repository().findById(foreignTermCreateRequested.get???()).ifPresent(ai->{
            
            ai // do something
            repository().save(ai);

            ForeignTermCreated foreignTermCreated = new ForeignTermCreated(ai);
            foreignTermCreated.publishAfterCommit();

         });
        */

    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public static void createDraft(TermCreateRequested termCreateRequested) {
        //implement business logic here:

        /** Example 1:  new item 
        Ai ai = new Ai();
        repository().save(ai);

        TermCreated termCreated = new TermCreated(ai);
        termCreated.publishAfterCommit();
        */

        /** Example 2:  finding and process
        

        repository().findById(termCreateRequested.get???()).ifPresent(ai->{
            
            ai // do something
            repository().save(ai);

            TermCreated termCreated = new TermCreated(ai);
            termCreated.publishAfterCommit();

         });
        */

    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public static void detectRisk(RiskDetectRequested riskDetectRequested) {
        //implement business logic here:

        /** Example 1:  new item 
        Ai ai = new Ai();
        repository().save(ai);

        RistDetected ristDetected = new RistDetected(ai);
        ristDetected.publishAfterCommit();
        */

        /** Example 2:  finding and process
        

        repository().findById(riskDetectRequested.get???()).ifPresent(ai->{
            
            ai // do something
            repository().save(ai);

            RistDetected ristDetected = new RistDetected(ai);
            ristDetected.publishAfterCommit();

         });
        */

    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public static void reviewTerm(TermReviewRequested termReviewRequested) {
        //implement business logic here:

        /** Example 1:  new item 
        Ai ai = new Ai();
        repository().save(ai);

        TermReviewed termReviewed = new TermReviewed(ai);
        termReviewed.publishAfterCommit();
        */

        /** Example 2:  finding and process
        

        repository().findById(termReviewRequested.get???()).ifPresent(ai->{
            
            ai // do something
            repository().save(ai);

            TermReviewed termReviewed = new TermReviewed(ai);
            termReviewed.publishAfterCommit();

         });
        */

    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public static void visualizeInterrelationship(
        VisualizationRequested visualizationRequested
    ) {
        //implement business logic here:

        /** Example 1:  new item 
        Ai ai = new Ai();
        repository().save(ai);

        TermVisualized termVisualized = new TermVisualized(ai);
        termVisualized.publishAfterCommit();
        */

        /** Example 2:  finding and process
        

        repository().findById(visualizationRequested.get???()).ifPresent(ai->{
            
            ai // do something
            repository().save(ai);

            TermVisualized termVisualized = new TermVisualized(ai);
            termVisualized.publishAfterCommit();

         });
        */

    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public static void modifyAiTerm(
        AiTermModifyRequested aiTermModifyRequested
    ) {
        //implement business logic here:

        /** Example 1:  new item 
        Ai ai = new Ai();
        repository().save(ai);

        AiTermModified aiTermModified = new AiTermModified(ai);
        aiTermModified.publishAfterCommit();
        */

        /** Example 2:  finding and process
        

        repository().findById(aiTermModifyRequested.get???()).ifPresent(ai->{
            
            ai // do something
            repository().save(ai);

            AiTermModified aiTermModified = new AiTermModified(ai);
            aiTermModified.publishAfterCommit();

         });
        */

    }
    //>>> Clean Arch / Port Method

}
//>>> DDD / Aggregate Root
