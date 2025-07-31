package self.infra;

import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
            value = "/terms",
            method = RequestMethod.POST,
            produces = "application/json;charset=UTF-8"
    )
    public Term createTerm(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestBody TermCreateRequestCommand createCommand,
            @AuthenticationPrincipal String userId
    ) throws Exception {
        System.out.println("##### /terms  called #####");
        Term term = new Term();
        term.setUserId(userId);
        term.setTitle(createCommand.getTitle());
        term.setContent(createCommand.getContent());
        term.setCategory(createCommand.getCategory());
        term.setProductName(createCommand.getProductName());
        term.setRequirement(createCommand.getRequirement());
        term.setUserCompany(createCommand.getUserCompany());
        term.setClient(createCommand.getClient());
        term.setTermType(createCommand.getTermType());
        term.setVersion("v1"); // Set initial version

        termRepository.save(term);
        
        // After save, the TermCreateRequested event will be published by onPostPersist
        
        return term;
    }


    @RequestMapping(
        value = "/terms/{id}/foreintermcreaterequest",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public Term foreinTermCreateRequest(
        HttpServletRequest request,
        HttpServletResponse response,
        @PathVariable("id") Long id,
        @RequestBody ForeinTermCreateRequestCommand foreinTermCreateRequestCommand,
        @AuthenticationPrincipal String userId
    ) throws Exception {
        System.out.println("##### /term/" + id + "/foreinTermCreateRequest  called #####");

        return termRepository.findById(id).map(originalTerm -> {
            // Check ownership
            if (!originalTerm.getUserId().equals(userId)) {
                throw new RuntimeException("User does not have permission to request foreign term creation for this term");
            }
            
            originalTerm.foreinTermCreateRequest(foreinTermCreateRequestCommand);
            
            // No need to save the originalTerm here as the event is what matters.
            // The actual new term is created when the response event is received.
            
            return originalTerm;
        }).orElseThrow(() -> new Exception("Original term not found"));
    }

    @RequestMapping(
        value = "/terms/riskdectectrequest",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public Term riskDectectRequest(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestBody RiskDectectRequestCommand riskDectectRequestCommand,
        @AuthenticationPrincipal String userId
    ) throws Exception {
        System.out.println("##### /term/riskDectectRequest  called #####");
        Term term = new Term();
        term.setUserId(userId);
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
        @RequestBody TermReviewRequestCommand termReviewRequestCommand,
        @AuthenticationPrincipal String userId
    ) throws Exception {
        System.out.println("##### /term/termReviewRequest  called #####");
        Term term = new Term();
        term.setUserId(userId);
        term.termReviewRequest(termReviewRequestCommand);
        termRepository.save(term);
        return term;
    }

    @RequestMapping(
        value = "/terms/{id}/ai-modify",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public Term aiTermModifyRequest(
        HttpServletRequest request,
        HttpServletResponse response,
        @PathVariable("id") Long id,
        @RequestBody AiTermModifyRequestCommand aiTermModifyRequestCommand,
        @AuthenticationPrincipal String userId
    ) throws Exception {
        System.out.println("##### /terms/" + id + "/ai-modify called #####");

        Term originalTerm = termRepository.findById(id)
            .orElseThrow(() -> new Exception("Original term not found"));

        // Check ownership
        if (!originalTerm.getUserId().equals(userId)) {
            throw new Exception("User does not have permission to modify this term");
        }

        Term newVersionTerm = Term.createNewVersionFrom(originalTerm);
        newVersionTerm.setUpdateType("AI_MODIFY");
        
        // The aiTermModifyRequest method in Term.java is now just a placeholder
        // The actual event publishing is handled by onPostPersist
        
        termRepository.save(newVersionTerm);
        return newVersionTerm;
    }

    @RequestMapping(
        value = "/terms/{id}/direct-update",
        method = RequestMethod.PUT,
        produces = "application/json;charset=UTF-8"
    )
    public Term directUpdateTerm(
        HttpServletRequest request,
        HttpServletResponse response,
        @PathVariable("id") Long id,
        @RequestBody TermDirectUpdateRequestCommand updateCommand,
        @AuthenticationPrincipal String userId
    ) throws Exception {
        System.out.println("##### /terms/" + id + "/direct-update called #####");

        Term originalTerm = termRepository.findById(id)
            .orElseThrow(() -> new Exception("Original term not found"));

        // Check ownership
        if (!originalTerm.getUserId().equals(userId)) {
            throw new Exception("User does not have permission to modify this term");
        }

        Term newVersionTerm = Term.createNewVersionFrom(originalTerm);
        newVersionTerm.setUpdateType("DIRECT_UPDATE");

        // Apply changes from the command
        newVersionTerm.setTitle(updateCommand.getTitle());
        newVersionTerm.setContent(updateCommand.getContent());
        newVersionTerm.setMemo(updateCommand.getMemo());
        
        termRepository.save(newVersionTerm);
        return newVersionTerm;
    }

    @RequestMapping(
        value = "/terms/visualizationrequest",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public Term visualizationRequest(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestBody VisualizationRequestCommand visualizationRequestCommand,
        @AuthenticationPrincipal String userId
    ) throws Exception {
        System.out.println("##### /term/visualizationRequest  called #####");
        Term term = new Term();
        term.setUserId(userId);
        term.visualizationRequest(visualizationRequestCommand);
        termRepository.save(term);
        return term;
    }
}
//>>> Clean Arch / Inbound Adaptor
