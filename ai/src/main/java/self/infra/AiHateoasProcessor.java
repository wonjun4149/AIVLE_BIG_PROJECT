package self.infra;

import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;
import self.domain.*;

@Component
public class AiHateoasProcessor
    implements RepresentationModelProcessor<EntityModel<Ai>> {

    @Override
    public EntityModel<Ai> process(EntityModel<Ai> model) {
        return model;
    }
}
