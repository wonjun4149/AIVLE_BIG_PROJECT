package self.infra;

import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;
import self.domain.*;

@Component
public class TermHateoasProcessor
    implements RepresentationModelProcessor<EntityModel<Term>> {

    @Override
    public EntityModel<Term> process(EntityModel<Term> model) {
        return model;
    }
}
