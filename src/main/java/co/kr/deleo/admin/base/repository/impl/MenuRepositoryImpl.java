package co.kr.deleo.admin.base.repository.impl;

import co.kr.deleo.admin.base.dto.MenuDto;
import co.kr.deleo.admin.base.repository.MenuRepositoryCustom;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.BiFunction;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static co.kr.deleo.admin.base.dto.QMenuDto.menuDto;

@RequiredArgsConstructor
public class MenuRepositoryImpl implements MenuRepositoryCustom {
    private final JPAQueryFactory queryFactory;

    @Override
    public List<MenuDto> findByMenuDiv(String menuDiv) {
        return queryFactory
                .selectFrom(menuDto)
                .where(menuDto.menuDiv.eq(menuDiv))
                .fetch();
    }

    @Override
    public List<MenuDto> findMenuTree(String menuDiv) {
        List<MenuDto> menuDtos = findByMenuDiv(menuDiv);

        int maxLevel = menuDtos.stream()
                            .max(Comparator.comparing(MenuDto::getMenuLvl))
                            .get()
                            .getMenuLvl();

        BiFunction<List<MenuDto>, , List<MenuDto>> getMenuLvlList
                = (menuList, level) -> menuList.stream()
                .filter(menu -> menu.getPMenuCd().equals() == level)
                .collect(Collectors.toList());

        List<MenuDto> result = new ArrayList<>();

        IntStream range = IntStream.range(0, maxLevel + 1);
        range.forEach(lvl -> {
            System.out.println("menu level " + lvl);
            result.addAll(getMenuLvlList.apply(menuDtos, lvl));
        });

        result.forEach(menuDto -> System.out.println(menuDto.getMenuNm()+"::"+ menuDto.getMenuLvl()));

        return result;
    }
}
