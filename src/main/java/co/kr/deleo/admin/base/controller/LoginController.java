package co.kr.deleo.admin.base.controller;

import co.kr.deleo.admin.base.Constant;
import co.kr.deleo.admin.base.dto.MenuDto;
import co.kr.deleo.admin.base.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Locale;

@Controller
public class LoginController {

    @Autowired
    private MenuRepository menuRepository;

    @RequestMapping("/main")
    public String main(Model model) {
//        menuRepository.findAllByMenuDivAndUseYnAndLangCd(
//                Sort.by(Sort.Direction.ASC, "menu_lvl", "menu_ord"),
//                MenuDto.builder()
//                .menuDiv(Constant.MENU_DIV_ADMIN.name())
//                .menuType(Constant.MENU.name())
//                .useYn("Y")
//                .langCd(Locale.KOREA.getLanguage())
//                .build());


        return "main";
    }


    @RequestMapping("/logout")
    public String logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null){
            new SecurityContextLogoutHandler().logout(request, response, auth);
        }

        return "redirect:/";
    }

    @RequestMapping("/loginSuccess")
    public String loginSuccess() {

        return "main";
    }

}
