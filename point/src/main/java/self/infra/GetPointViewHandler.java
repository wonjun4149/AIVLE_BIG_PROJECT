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
    //>>> DDD / CQRS
}
