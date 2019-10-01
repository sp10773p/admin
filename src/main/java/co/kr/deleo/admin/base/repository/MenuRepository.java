package co.kr.deleo.admin.base.repository;

import co.kr.deleo.admin.base.dto.MenuDto;
import co.kr.deleo.admin.base.dto.UserInfo;
import org.hibernate.boot.model.source.spi.Sortable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MenuRepository extends JpaRepository<MenuDto, Long>, MenuRepositoryCustom {

    Optional<List<MenuDto>> findAllByMenuDivAndUseYnAndLangCd(Sort sort, String menuDiv, String useNn, String langCd);
}
