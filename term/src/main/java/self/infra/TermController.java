package self.infra;

import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import self.domain.*;
import self.service.TermService;
import java.util.Date; // import 추가

//<<< Clean Arch / Inbound Adaptor

@RestController
// @RequestMapping(value="/terms")
public class TermController {

    @Autowired
    TermService termService;

    @RequestMapping(
            value = "/terms",
            method = RequestMethod.POST,
            produces = "application/json;charset=UTF-8"
    )
    public Term createTerm(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestBody TermCreateRequestCommand createCommand,
            @RequestHeader("x-authenticated-user-uid") String userId
    ) throws Exception {
        System.out.println("##### /terms  called #####");
        System.out.println("##### Received x-authenticated-user-uid: " + userId + " #####");
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

        // termService를 통해 저장
        termService.createTerm(term);
        
        // TODO: TermCreateRequested 이벤트 발행 로직을 TermService.createTerm 내부에 구현해야 함
        
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
        @PathVariable("id") String id, // Long -> String
        @RequestBody ForeinTermCreateRequestCommand foreinTermCreateRequestCommand,
        @RequestHeader("X-Authenticated-User-Uid") String userId
    ) throws Exception {
        System.out.println("##### /term/" + id + "/foreinTermCreateRequest  called #####");

        return termService.findById(id).map(originalTerm -> {
            if (!originalTerm.getUserId().equals(userId)) {
                throw new RuntimeException("User does not have permission for this term");
            }
            
            // TODO: foreinTermCreateRequest 로직을 TermService로 이동해야 함
            // originalTerm.foreinTermCreateRequest(foreinTermCreateRequestCommand);
            
            return originalTerm;
        }).orElseThrow(() -> new Exception("Original term not found"));
    }

    // riskDectectRequest, termReviewRequest, visualizationRequest는
    // Term 객체를 먼저 생성하지 않고 바로 서비스 로직을 호출해야 합니다.
    // 이 부분은 로직의 재설계가 필요하여 일단 주석 처리합니다.
    /*
    @RequestMapping(
        value = "/terms/riskdectectrequest",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public Term riskDectectRequest(...) throws Exception { ... }

    @RequestMapping(
        value = "/terms/termreviewrequest",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public Term termReviewRequest(...) throws Exception { ... }

    @RequestMapping(
        value = "/terms/visualizationrequest",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public Term visualizationRequest(...) throws Exception { ... }
    */

    @RequestMapping(
        value = "/terms/{id}/ai-modify",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public Term aiTermModifyRequest(
        HttpServletRequest request,
        HttpServletResponse response,
        @PathVariable("id") String id, // Long -> String
        @RequestBody AiTermModifyRequestCommand aiTermModifyRequestCommand,
        @RequestHeader("X-Authenticated-User-Uid") String userId
    ) throws Exception {
        System.out.println("##### /terms/" + id + "/ai-modify called #####");

        Term originalTerm = termService.findById(id)
            .orElseThrow(() -> new Exception("Original term not found"));

        if (!originalTerm.getUserId().equals(userId)) {
            throw new Exception("User does not have permission to modify this term");
        }

        Term newVersionTerm = termService.createNewVersionFrom(originalTerm);
        newVersionTerm.setUpdateType("AI_MODIFY");
        newVersionTerm.setModifiedAt(new Date()); // 수정 시간 설정
        
        // TODO: aiTermModifyRequest 로직을 TermService로 이동해야 함
        
        termService.save(newVersionTerm);
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
        @PathVariable("id") String id, // Long -> String
        @RequestBody TermDirectUpdateRequestCommand updateCommand,
        @RequestHeader("X-Authenticated-User-Uid") String userId
    ) throws Exception {
        System.out.println("##### /terms/" + id + "/direct-update called #####");

        Term originalTerm = termService.findById(id)
            .orElseThrow(() -> new Exception("Original term not found"));

        if (!originalTerm.getUserId().equals(userId)) {
            throw new Exception("User does not have permission to modify this term");
        }

        Term newVersionTerm = termService.createNewVersionFrom(originalTerm);
        newVersionTerm.setUpdateType("DIRECT_UPDATE");
        newVersionTerm.setModifiedAt(new Date()); // 수정 시간 설정

        // Apply changes from the command
        newVersionTerm.setTitle(updateCommand.getTitle());
        newVersionTerm.setContent(updateCommand.getContent());
        newVersionTerm.setMemo(updateCommand.getMemo());
        
        termService.save(newVersionTerm);
        return newVersionTerm;
    }
}