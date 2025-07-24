package self.infra;

import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import self.domain.*;

//<<< Clean Arch / Inbound Adaptor

@RestController
// @RequestMapping(value="/terms")
@Transactional
public class TermController {

    @Autowired
    TermRepository termRepository;

    @RequestMapping(
        value = "/terms/foreintermcreaterequest",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public Term foreinTermCreateRequest(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestBody ForeinTermCreateRequestCommand foreinTermCreateRequestCommand
    ) throws Exception {
        System.out.println("##### /term/foreinTermCreateRequest  called #####");
        Term term = new Term();
        term.foreinTermCreateRequest(foreinTermCreateRequestCommand);
        termRepository.save(term);
        return term;
    }

    @RequestMapping(
        value = "/terms/riskdectectrequest",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public Term riskDectectRequest(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestBody RiskDectectRequestCommand riskDectectRequestCommand
    ) throws Exception {
        System.out.println("##### /term/riskDectectRequest  called #####");
        Term term = new Term();
        term.riskDectectRequest(riskDectectRequestCommand);
        termRepository.save(term);
        return term;
    }

    @RequestMapping(
        value = "/terms/termreviewrequest",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public Term termReviewRequest(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestBody TermReviewRequestCommand termReviewRequestCommand
    ) throws Exception {
        System.out.println("##### /term/termReviewRequest  called #####");
        Term term = new Term();
        term.termReviewRequest(termReviewRequestCommand);
        termRepository.save(term);
        return term;
    }

    @RequestMapping(
        value = "/terms/aitermmodifyrequest",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public Term aiTermModifyRequest(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestBody AiTermModifyRequestCommand aiTermModifyRequestCommand
    ) throws Exception {
        System.out.println("##### /term/aiTermModifyRequest  called #####");
        Term term = new Term();
        term.aiTermModifyRequest(aiTermModifyRequestCommand);
        termRepository.save(term);
        return term;
    }

    @RequestMapping(
        value = "/terms/visualizationrequest",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public Term visualizationRequest(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestBody VisualizationRequestCommand visualizationRequestCommand
    ) throws Exception {
        System.out.println("##### /term/visualizationRequest  called #####");
        Term term = new Term();
        term.visualizationRequest(visualizationRequestCommand);
        termRepository.save(term);
        return term;
    }
}
//>>> Clean Arch / Inbound Adaptor
