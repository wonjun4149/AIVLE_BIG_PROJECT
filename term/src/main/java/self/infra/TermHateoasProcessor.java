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
        model.add(
            Link
                .of(
                    model.getRequiredLink("self").getHref() +
                    "/foreintermcreaterequest"
                )
                .withRel("foreintermcreaterequest")
        );
        model.add(
            Link
                .of(
                    model.getRequiredLink("self").getHref() +
                    "/riskdectectrequest"
                )
                .withRel("riskdectectrequest")
        );
        model.add(
            Link
                .of(
                    model.getRequiredLink("self").getHref() +
                    "/termreviewrequest"
                )
                .withRel("termreviewrequest")
        );
        model.add(
            Link
                .of(
                    model.getRequiredLink("self").getHref() +
                    "/aitermmodifyrequest"
                )
                .withRel("aitermmodifyrequest")
        );
        model.add(
            Link
                .of(
                    model.getRequiredLink("self").getHref() +
                    "/visualizationrequest"
                )
                .withRel("visualizationrequest")
        );

        return model;
    }
}
