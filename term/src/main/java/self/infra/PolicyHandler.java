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
    TermRepository termRepository;

    @StreamListener(KafkaProcessor.INPUT)
    public void whatever(@Payload String eventString) {}

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='TermCreated'"
    )
    public void wheneverTermCreated_RegisterTerm(
        @Payload TermCreated termCreated
    ) {
        TermCreated event = termCreated;
        System.out.println(
            "\n\n##### listener RegisterTerm : " + termCreated + "\n\n"
        );

        // Sample Logic //
        Term.registerTerm(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='ForeignTermCreated'"
    )
    public void wheneverForeignTermCreated_RegisterTerm(
        @Payload ForeignTermCreated foreignTermCreated
    ) {
        ForeignTermCreated event = foreignTermCreated;
        System.out.println(
            "\n\n##### listener RegisterTerm : " + foreignTermCreated + "\n\n"
        );

        // Sample Logic //
        Term.registerTerm(event);
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
        Term.saveAnalysis(event);
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
        Term.saveAnalysis(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='AiTermModified'"
    )
    public void wheneverAiTermModified_SaveModifiedTerm(
        @Payload AiTermModified aiTermModified
    ) {
        AiTermModified event = aiTermModified;
        System.out.println(
            "\n\n##### listener SaveModifiedTerm : " + aiTermModified + "\n\n"
        );

        // Sample Logic //
        Term.saveModifiedTerm(event);
    }
}
//>>> Clean Arch / Inbound Adaptor
