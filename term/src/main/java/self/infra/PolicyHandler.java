package self.infra;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import javax.naming.NameParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import self.config.kafka.KafkaProcessor;
import self.domain.*;
import self.service.TermService;

import java.util.concurrent.ExecutionException;

//<<< Clean Arch / Inbound Adaptor
@Service
public class PolicyHandler {

    @Autowired
    TermService termService;

    @StreamListener(KafkaProcessor.INPUT)
    public void whatever(@Payload String eventString) {}

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='TermCreated'"
    )
    public void wheneverTermCreated_RegisterTerm(
        @Payload TermCreated termCreated
    ) throws ExecutionException, InterruptedException {
        TermCreated event = termCreated;
        System.out.println(
            "\n\n##### listener RegisterTerm : " + termCreated + "\n\n"
        );

        // Sample Logic //
        termService.registerTerm(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='ForeignTermCreated'"
    )
    public void wheneverForeignTermCreated_RegisterTerm(
        @Payload ForeignTermCreated foreignTermCreated
    ) throws ExecutionException, InterruptedException {
        ForeignTermCreated event = foreignTermCreated;
        System.out.println(
            "\n\n##### listener RegisterTerm : " + foreignTermCreated + "\n\n"
        );

        // Sample Logic //
        termService.registerTerm(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='RistDetected'"
    )
    public void wheneverRistDetected_SaveAnalysis(
        @Payload RistDetected ristDetected
    ) {
        RistDetected event = ristDetected;
        System.out.println(
            "\n\n##### listener SaveAnalysis : " + ristDetected + "\n\n"
        );

        // Sample Logic //
        // Term.saveAnalysis(event); // TODO: Move this logic to TermService
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='TermReviewed'"
    )
    public void wheneverTermReviewed_SaveAnalysis(
        @Payload TermReviewed termReviewed
    ) {
        TermReviewed event = termReviewed;
        System.out.println(
            "\n\n##### listener SaveAnalysis : " + termReviewed + "\n\n"
        );

        // Sample Logic //
        // Term.saveAnalysis(event); // TODO: Move this logic to TermService
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='AiTermModified'"
    )
    public void wheneverAiTermModified_SaveModifiedTerm(
        @Payload AiTermModified aiTermModified
    ) throws ExecutionException, InterruptedException {
        AiTermModified event = aiTermModified;
        System.out.println(
            "\n\n##### listener SaveModifiedTerm : " + aiTermModified + "\n\n"
        );

        // Sample Logic //
        termService.saveModifiedTerm(event);
    }
}
//>>> Clean Arch / Inbound Adaptor
