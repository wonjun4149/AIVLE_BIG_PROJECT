package self.infra;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import self.config.kafka.KafkaProcessor;
import self.domain.*;
import self.service.PointService;

import java.util.concurrent.ExecutionException;

@Service
public class PolicyHandler {

    @Autowired
    PointService pointService;

    @StreamListener(KafkaProcessor.INPUT)
    public void whatever(@Payload String eventString) {}

    @StreamListener(value = KafkaProcessor.INPUT, condition = "headers['type']=='UserSignedUp'")
    public void wheneverUserSignedUp_CreateInitialPoint(@Payload UserSignedUp userSignedUp) throws ExecutionException, InterruptedException {
        System.out.println("\n\n##### listener CreateInitialPoint : " + userSignedUp + "\n\n");
        pointService.createInitialPoint(userSignedUp);
    }

    @StreamListener(value = KafkaProcessor.INPUT, condition = "headers['type']=='TermCreateRequested'")
    public void wheneverTermCreateRequested_ReducePoint(@Payload TermCreateRequested termCreateRequested) throws ExecutionException, InterruptedException {
        System.out.println("\n\n##### listener ReducePoint : " + termCreateRequested + "\n\n");
        pointService.reducePointForEvent(termCreateRequested.getUserId(), "일반 약관 생성");
    }

    @StreamListener(value = KafkaProcessor.INPUT, condition = "headers['type']=='ForeignTermCreateRequested'")
    public void wheneverForeignTermCreateRequested_ReducePoint(@Payload ForeignTermCreateRequested foreignTermCreateRequested) throws ExecutionException, InterruptedException {
        System.out.println("\n\n##### listener ReducePoint : " + foreignTermCreateRequested + "\n\n");
        pointService.reducePointForEvent(foreignTermCreateRequested.getUserId(), "외국어 약관 생성");
    }

    @StreamListener(value = KafkaProcessor.INPUT, condition = "headers['type']=='RiskDetectRequested'")
    public void wheneverRiskDetectRequested_ReducePoint(@Payload RiskDetectRequested riskDetectRequested) throws ExecutionException, InterruptedException {
        System.out.println("\n\n##### listener ReducePoint : " + riskDetectRequested + "\n\n");
        pointService.reducePointForEvent(riskDetectRequested.getUserId(), "리스크 검사");
    }

    @StreamListener(value = KafkaProcessor.INPUT, condition = "headers['type']=='AiTermModifyRequested'")
    public void wheneverAiTermModifyRequested_ReducePoint(@Payload AiTermModifyRequested aiTermModifyRequested) throws ExecutionException, InterruptedException {
        System.out.println("\n\n##### listener ReducePoint : " + aiTermModifyRequested + "\n\n");
        pointService.reducePointForEvent(aiTermModifyRequested.getUserId(), "AI 약관 수정");
    }
}
