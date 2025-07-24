package self.infra;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import javax.naming.NameParser;
import javax.naming.NameParser;
import javax.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import self.config.kafka.KafkaProcessor;
import self.domain.*;

//<<< Clean Arch / Inbound Adaptor
@Service
@Transactional
public class PolicyHandler {

    @Autowired
    AiRepository aiRepository;

    @StreamListener(KafkaProcessor.INPUT)
    public void whatever(@Payload String eventString) {}

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='ForeignTermCreateRequested'"
    )
    public void wheneverForeignTermCreateRequested_CreateForeignDraft(
        @Payload ForeignTermCreateRequested foreignTermCreateRequested
    ) {
        ForeignTermCreateRequested event = foreignTermCreateRequested;
        System.out.println(
            "\n\n##### listener CreateForeignDraft : " +
            foreignTermCreateRequested +
            "\n\n"
        );

        // Sample Logic //
        Ai.createForeignDraft(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='TermCreateRequested'"
    )
    public void wheneverTermCreateRequested_CreateDraft(
        @Payload TermCreateRequested termCreateRequested
    ) {
        TermCreateRequested event = termCreateRequested;
        System.out.println(
            "\n\n##### listener CreateDraft : " + termCreateRequested + "\n\n"
        );

        // Sample Logic //
        Ai.createDraft(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='RiskDetectRequested'"
    )
    public void wheneverRiskDetectRequested_DetectRisk(
        @Payload RiskDetectRequested riskDetectRequested
    ) {
        RiskDetectRequested event = riskDetectRequested;
        System.out.println(
            "\n\n##### listener DetectRisk : " + riskDetectRequested + "\n\n"
        );

        // Sample Logic //
        Ai.detectRisk(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='TermReviewRequested'"
    )
    public void wheneverTermReviewRequested_ReviewTerm(
        @Payload TermReviewRequested termReviewRequested
    ) {
        TermReviewRequested event = termReviewRequested;
        System.out.println(
            "\n\n##### listener ReviewTerm : " + termReviewRequested + "\n\n"
        );

        // Sample Logic //
        Ai.reviewTerm(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='VisualizationRequested'"
    )
    public void wheneverVisualizationRequested_VisualizeInterrelationship(
        @Payload VisualizationRequested visualizationRequested
    ) {
        VisualizationRequested event = visualizationRequested;
        System.out.println(
            "\n\n##### listener VisualizeInterrelationship : " +
            visualizationRequested +
            "\n\n"
        );

        // Sample Logic //
        Ai.visualizeInterrelationship(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='AiTermModifyRequested'"
    )
    public void wheneverAiTermModifyRequested_ModifyAiTerm(
        @Payload AiTermModifyRequested aiTermModifyRequested
    ) {
        AiTermModifyRequested event = aiTermModifyRequested;
        System.out.println(
            "\n\n##### listener ModifyAiTerm : " +
            aiTermModifyRequested +
            "\n\n"
        );

        // Sample Logic //
        Ai.modifyAiTerm(event);
    }
}
//>>> Clean Arch / Inbound Adaptor
