package co.kr.deleo.admin.base.repository;

import co.kr.deleo.admin.base.dto.MenuDto;

import java.util.List;

public interface MenuRepositoryCustom {

    List<MenuDto> findByMenuDiv(String menuDiv);

    List<MenuDto> findMenuTree(String menuDiv);
}
