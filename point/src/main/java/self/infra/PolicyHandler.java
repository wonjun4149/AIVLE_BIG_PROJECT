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
    PointRepository pointRepository;

    @StreamListener(KafkaProcessor.INPUT)
    public void whatever(@Payload String eventString) {}

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='TermCreateRequested'"
    )
    public void wheneverTermCreateRequested_ReducePoint(
        @Payload TermCreateRequested termCreateRequested
    ) {
        TermCreateRequested event = termCreateRequested;
        System.out.println(
            "\n\n##### listener ReducePoint : " + termCreateRequested + "\n\n"
        );

        // Sample Logic //
        Point.reducePoint(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='ForeignTermCreateRequested'"
    )
    public void wheneverForeignTermCreateRequested_ReducePoint(
        @Payload ForeignTermCreateRequested foreignTermCreateRequested
    ) {
        ForeignTermCreateRequested event = foreignTermCreateRequested;
        System.out.println(
            "\n\n##### listener ReducePoint : " +
            foreignTermCreateRequested +
            "\n\n"
        );

        // Sample Logic //
        Point.reducePoint(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='RiskDetectRequested'"
    )
    public void wheneverRiskDetectRequested_ReducePoint(
        @Payload RiskDetectRequested riskDetectRequested
    ) {
        RiskDetectRequested event = riskDetectRequested;
        System.out.println(
            "\n\n##### listener ReducePoint : " + riskDetectRequested + "\n\n"
        );

        // Sample Logic //
        Point.reducePoint(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='AiTermModifyRequested'"
    )
    public void wheneverAiTermModifyRequested_ReducePoint(
        @Payload AiTermModifyRequested aiTermModifyRequested
    ) {
        AiTermModifyRequested event = aiTermModifyRequested;
        System.out.println(
            "\n\n##### listener ReducePoint : " + aiTermModifyRequested + "\n\n"
        );

        // Sample Logic //
        Point.reducePoint(event);
    }
}
//>>> Clean Arch / Inbound Adaptor
