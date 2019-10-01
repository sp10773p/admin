package co.kr.deleo.admin.base.dto;

import lombok.*;

import javax.persistence.*;
import java.util.Date;
import java.util.List;

@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
@Entity(name = "ts_menu")
public class MenuDto {

    @Id @GeneratedValue(generator = "seq_ts_menu")
    @Column(name = "menu_cd")
    private Integer menuCd;

    @Column(name = "p_menu_cd")
    private Integer pMenuCd;

    @Column(name = "menu_nm")
    private String menuNm;

    @Column(name = "menu_url")
    private String menuUrl;

    @Column(name = "lang_cd")
    private String langCd;

    @Column(name = "menu_div")
    private String menuDiv;

    @Column(name = "menu_ord")
    private Integer menuOrd;

    @Column(name = "menu_lvl")
    private Integer menuLvl;

    @Column(name = "menu_type")
    private String menuType;

    @Column(name = "use_yn")
    @Builder.Default
    private String useYn = "Y";

    @Column(name = "icon_cls")
    private String iconCls;

    private String creator;
    private String modifier;

    @Temporal(TemporalType.TIMESTAMP)
    @Builder.Default
    private Date created = new Date();

    @Temporal(TemporalType.TIMESTAMP)
    @Builder.Default
    private Date modified = new Date();

    @Transient
    @Builder.Default
    private Boolean isOpen = false;

    @Transient
    private String leaf;

    @Transient
    private String navi;

    @Transient
    private List<MenuDto> subMenuList;

}
