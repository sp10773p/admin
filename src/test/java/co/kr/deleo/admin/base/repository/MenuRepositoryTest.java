package co.kr.deleo.admin.base.repository;

import co.kr.deleo.admin.base.Constant;
import co.kr.deleo.admin.base.dto.MenuDto;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Sort;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.junit4.SpringRunner;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
public class MenuRepositoryTest {

    @Autowired
    private MenuRepository menuRepository;

    @Test
    @Rollback(false)
    public void save_test() {
        String menuDiv = Constant.ADMIN.name();
        String menuType = Constant.MENU.name();
        String langCd = Locale.KOREA.getLanguage();

        MenuDto menu = menuRepository.save(MenuDto.builder()
                .menuNm("Admin")
                .menuDiv(menuDiv)
                .menuLvl(0)
                .menuOrd(0)
                .menuType(menuType)
                .langCd(langCd)
                .creator("admin")
                .modifier("admin")
                .build());

        menu = menuRepository.save(MenuDto.builder()
                .pMenuCd(menu.getMenuCd())
                .menuNm("시스템 관리")
                .menuDiv(menuDiv)
                .menuLvl(1)
                .menuOrd(1)
                .menuType(menuType)
                .langCd(langCd)
                .creator("admin")
                .modifier("admin")
                .build());

        menuRepository.save(MenuDto.builder()
                .pMenuCd(menu.getMenuCd())
                .menuNm("사용자 관리")
                .menuOrd(1)
                .menuUrl("/view?viewName=sys/users")
                .menuDiv(menuDiv)
                .menuLvl(2)
                .menuType(menuType)
                .langCd(langCd)
                .creator("admin")
                .modifier("admin")
                .build());

        menuRepository.save(MenuDto.builder()
                .pMenuCd(menu.getMenuCd())
                .menuNm("메뉴 관리")
                .menuOrd(2)
                .menuUrl("/view?viewName=sys/menu")
                .menuDiv(menuDiv)
                .menuLvl(2)
                .menuType(menuType)
                .langCd(langCd)
                .creator("admin")
                .modifier("admin")
                .build());

        menuRepository.save(MenuDto.builder()
                .pMenuCd(menu.getMenuCd())
                .menuNm("권한 관리")
                .menuOrd(3)
                .menuUrl("/view?viewName=sys/auth")
                .menuDiv(menuDiv)
                .menuLvl(2)
                .menuType(menuType)
                .langCd(langCd)
                .creator("admin")
                .modifier("admin")
                .build());
    }

    @Test
    public void sort_test() {
        Optional<List<MenuDto>> menuList =
                menuRepository.findAllByMenuDivAndUseYnAndLangCd(
                                Sort.by(Sort.Direction.ASC, "menuLvl"),
                                Constant.ADMIN.name(), "Y", Locale.KOREA.getLanguage());
        Assert.assertTrue(menuList.isPresent());

        Assert.assertEquals(menuList.get().get(0).getMenuLvl(), Integer.valueOf(0));
        Assert.assertEquals(menuList.get().get(0).getMenuOrd(), Integer.valueOf(0));
    }

    @Test
    public void findMenuTree_test() {
        menuRepository.findMenuTree(Constant.ADMIN.name());
    }


    @Test
    public void dsl_test() {
        // given
        MenuDto menuDto = new MenuDto();
        menuDto.setMenuDiv(Constant.ADMIN.name());

        // when
        List<MenuDto> menuDtos = menuRepository.findByMenuDiv(Constant.ADMIN.name());

        menuDtos.forEach(System.out::println);


        // then
        assertThat(menuDtos.size()).isGreaterThan(0);
    }

}