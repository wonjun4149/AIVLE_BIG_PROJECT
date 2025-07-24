package self.infra;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import self.config.kafka.KafkaProcessor;
import self.domain.*;

@Service
public class GetPointViewHandler {

    //<<< DDD / CQRS
    @Autowired
    private GetPointRepository getPointRepository;

    @StreamListener(KafkaProcessor.INPUT)
    public void whenUserSignedUp_then_CREATE_1(
        @Payload UserSignedUp userSignedUp
    ) {
        try {
            if (!userSignedUp.validate()) return;

            // view 객체 생성
            GetPoint getPoint = new GetPoint();
            // view 객체에 이벤트의 Value 를 set 함
            getPoint.setUserid(userSignedUp.getId());
            // view 레파지 토리에 save
            getPointRepository.save(getPoint);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    //>>> DDD / CQRS
}
