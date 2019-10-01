/**
 * Created by sdh on 2017-01-04.
 */
var GLB_MONTH_IN_YEAR = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var GLB_SHORT_MONTH_IN_YEAR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var GLB_DAY_IN_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday","Thursday", "Friday", "Saturday"];
var GLB_SHORT_DAY_IN_WEEK = ["Sun", "Mon", "Tue", "Wed","Thu", "Fri", "Sat"];
/*---------------------------------------------------------------------------------*
 * String prototype
 *---------------------------------------------------------------------------------*/
/***
 * 날짜를 표현하는 스트링 값을 자바스크립트의 내장 객체인 Date 객체로 변환.
 * var date = "2002-03-05".toDate("YYYY-MM-DD")
 *  - 위의 예에서 date 변수는 실제로 2002년 3월 5일을 표현하는 Date 오브젝트를 가르킨다.
 *  - YYYY(YY)는 반드시 있어야 한다. YYYY(YY) 만 사용할 경우는 1월 1일을 기준으로하고 YYYY와 MM 만사용할 경우는 1일을 기준으로 한다.
 * @param pattern : pattern optional Date를 표현하고 있는 현재의 String을 pattern으로 표현한다. (default : YYYYMMDD)
 * @returns {Date}
 * @syntex
 * YYYY : year(4자리)
 * YY : year(2자리)
 * MM : month in year(number)
 * DD : day in month
 * HH : hour in day (0~23)
 * mm : minute in hour
 * ss : second in minute
 * SS : millisecond in second
 */
String.prototype.toDate = function(pattern) {
    var index;
    var year;
    var month;
    var day;
    var hour = 0;
    var min = 0;
    var sec = 0;
    var ms = 0;
    var newDate;
    if (pattern == null) {
        pattern = "YYYYMMDD";
    }
    if ((index = pattern.indexOf("YYYY")) == -1 ) {
        index = pattern.indexOf("YY");
        year = "20" + this.substr(index, 2);
    } else {
        year = this.substr(index, 4);
    }
    if ((index = pattern.indexOf("MM")) != -1 ) {
        month = this.substr(index, 2);
    } else {
        month = 1;
    }
    if ((index = pattern.indexOf("DD")) != -1 ) {
        day = this.substr(index, 2);
    } else {
        day = 1;
    }
    if ((index = pattern.indexOf("HH")) != -1 ) {
        hour = this.substr(index, 2);
    }
    if ((index = pattern.indexOf("mm")) != -1 ) {
        min = this.substr(index, 2);
    }
    if ((index = pattern.indexOf("ss")) != -1 ) {
        sec = this.substr(index, 2);
    }
    if ((index = pattern.indexOf("SS")) != -1 ) {
        ms = this.substr(index, 2);
    }
    newDate = new Date(year, month - 1, day, hour, min, sec, ms);
    if (month > 12) {
        newDate.setFullYear(year + 1);
    } else {
        newDate.setFullYear(year);
    }
    return newDate;
}

/***
 * format 메소드는 Date 객체가 가진 날짜를 지정된 포멧의 스트링으로 변환.
 * var dateStr = new Date().format("YYYYMMDD");
 * 참고 : Date 오브젝트 생성자들 - dateObj = new Date()
 * - dateObj = new Date(dateVal)
 * - dateObj = new Date(year, month, date[, hours[, minutes[, seconds[,ms]]]])
 * * 위의 예에서 오늘날짜가 2002년 3월 5일이라면 dateStr의 값은 "20020305"가 된다.
 * * default pattern은 "YYYYMMDD"이다.
 * @param : pattern optional 변환하고자 하는 패턴 스트링. (default : YYYYMMDD)
 * @returns {XML|string|*}
 * @syntex
 * YYYY : hour in am/pm (1~12)
 * MM : month in year(number)
 * MON : month in year(text) 예) "January"
 * mon : short month in year(text) 예) "Jan"
 * DD : day in month
 * DAY : day in week 예) "Sunday"
 * day : short day in week 예) "Sun"
 * hh : hour in am/pm (1~12)
 * HH : hour in day (0~23)
 * mm : minute in hour
 * ss : second in minute
 * SS : millisecond in second
 * a : am/pm 예) "AM"
 */
Date.prototype.format = function(pattern) {
    var lpad = function(s, padLength, padString){
        while(s.length < padLength)
            s = padString + s;

        return s;
    }

    var year = this.getFullYear();
    var month = this.getMonth() + 1;
    var day = this.getDate();
    var dayInWeek = this.getDay();
    var hour24 = this.getHours();
    var ampm = (hour24 < 12) ? "AM" : "PM";
    var hour12 = (hour24 > 12) ? (hour24 - 12) : hour24;
    var min = this.getMinutes();
    var sec = this.getSeconds();
    var YYYY = lpad("" + year, 4, '0');
    var YY = YYYY.substr(2);
    var MM = (("" + month).length == 1) ? "0" + month : "" + month;
    var MON = GLB_MONTH_IN_YEAR[month-1];
    var mon = GLB_SHORT_MONTH_IN_YEAR[month-1];
    var DD = (("" + day).length == 1) ? "0" + day : "" + day;
    var DAY = GLB_DAY_IN_WEEK[dayInWeek];
    var day = GLB_SHORT_DAY_IN_WEEK[dayInWeek];
    var HH = (("" + hour24).length == 1) ? "0" + hour24 : "" + hour24;
    var hh = (("" + hour12).length == 1) ? "0" + hour12 : "" + hour12;
    var mm = (("" + min).length == 1) ? "0" + min : "" + min;
    var ss = (("" + sec).length == 1) ? "0" + sec : "" + sec;
    var SS = "" + this.getMilliseconds();
    var dateStr;
    var index = -1;
    if (typeof(pattern) == "undefined") {
        dateStr = "YYYYMMDD";
    } else {
        dateStr = pattern;
    }
    dateStr = dateStr.replace(/YYYY/g, YYYY);
    dateStr = dateStr.replace(/YY/g, YY);
    dateStr = dateStr.replace(/MM/g, MM);
    dateStr = dateStr.replace(/MON/g, MON);
    dateStr = dateStr.replace(/mon/g, mon);
    dateStr = dateStr.replace(/DD/g, DD);
    dateStr = dateStr.replace(/DAY/g, DAY);
    dateStr = dateStr.replace(/day/g, day);
    dateStr = dateStr.replace(/hh/g, hh);
    dateStr = dateStr.replace(/HH/g, HH);
    dateStr = dateStr.replace(/mm/g, mm);
    dateStr = dateStr.replace(/ss/g, ss);
    dateStr = dateStr.replace(/(s+)a/g, "$1" + ampm);
    return dateStr;
};
/***
 * 현재 Date 객체의 날짜보다 이전/이후날짜를 가진 Date 객체를 리턴한다.
 * 예를 들어 내일 날짜를 얻으려면 다음과 같이 하면 된다.
 * var oneDayAfter = new Date.after(0, 0, 1);
 * alert(new Date().after(1, 1, 1, 1, 1, 1).format("YYYYMMDD HHmmss"));
 * 참고 : Date 오브젝트 생성자들 - dateObj = new Date()
 * - dateObj = new Date(dateVal)
 * - dateObj = new Date(year, month, date[, hours[, minutes[, seconds[,ms]]]])
 * * 위의 예에서 오늘날짜가 2002년 3월 5일이라면 dateStr의 값은 "20020305"가 된다.
 * * default pattern은 "YYYYMMDD"이다.
 * @sig : [years[, months[, dates[, hours[, minutes[, seconds[, mss]]]]]]]
 * @param : years optional 이후 년수
 * @param : months optional 이후 월수
 * @param : dates optional 이후 일수
 * @param : hours optional 이후 시간수
 * @param : minutes optional 이후 분수
 * @param : seconds optional 이후 초수
 * @param : mss optional 이후 밀리초수
 * @return : Date
 */
Date.prototype.dateAdd = function(years, months, dates, hours, miniutes, seconds, mss) {
    if (years == null) years = 0;
    if (months == null) months = 0;
    if (dates == null) dates = 0;
    if (hours == null) hours = 0;
    if (miniutes == null) miniutes = 0;
    if (seconds == null) seconds = 0;
    if (mss == null) mss = 0;
    return new Date(this.getFullYear() + years,
        this.getMonth() + months,
        this.getDate() + dates,
        this.getHours() + hours,
        this.getMinutes() + miniutes,
        this.getSeconds() + seconds,
        this.getMilliseconds() + mss
    );
};
/***
 * 현재 Date 객체의 날짜보다 이전/이후날짜를 가진 Date 객체를 리턴한다.
 * @param pattern : 'y','M','d','h','m','s'
 * @param amount : 더하거나 뺄 값
 * @returns {Date}
 */
Date.prototype.dateAdd2 = function(pattern, amount) {
    var years = this.getFullYear();
    var months = this.getMonth();
    var dates = this.getDate();
    var hours = this.getHours();
    var miniutes = this.getMinutes();
    var seconds = this.getSeconds();
    if ( pattern == 'y' ) {
        years += amount;
    } else if ( pattern == 'M' ) {
        months += amount;
    } else if ( pattern == 'h' ) {
        hours += amount;
    } else if ( pattern == 'm' ) {
        miniutes += amount;
    } else if ( pattern == 's' ) {
        seconds += amount;
    } else {
        dates += amount;
    }
    return new Date(years, months, dates, hours, miniutes, seconds, 0);
};
/***
 * 현재 Date 객체와 지정한 Date 객체의 형식에 따른 차이값 반환.
 * @param pattern : 'y','M','d','h','m','s'
 * @param date : Date
 * @returns int
 */
Date.prototype.dateDiff = function(pattern, date) {
    if ( pattern == 'y' ) { pattern = 'y'; }
    else if ( pattern == 'M' ) { pattern = 'M'; }
    else if ( pattern == 'h' ) { pattern = 'h'; }
    else if ( pattern == 'm' ) { pattern = 'm'; }
    else if ( pattern == 's' ) { pattern = 's'; }
    else { pattern = 'd'; }
    var diff_year = this.getFullYear() - date.getFullYear();
    if ( pattern == 'y' ) return diff_year;
    if ( pattern == 'M' ) return (diff_year * 12) + (this.getMonth() - date.getMonth());
    var diff_long = this - date;
    if ( pattern == 'h' ) return parseInt(diff_long/(1000*60*60 ), 10);
    if ( pattern == 'm' ) return parseInt(diff_long/(1000*60 ), 10);
    if ( pattern == 's' ) return parseInt(diff_long/(1000 ), 10);
    return parseInt(diff_long/(1000*60*60*24), 10);
};
/***
 * 현재 Date 객체와 지정한 Time 형식(날짜 문자열)의 형식에 따른 차이값 반환.
 * @param pattern : 'y','M','d','h','m','s'
 * @param time : 날짜 문자열
 * @param dpattern : 날짜 문자열 형식
 * @returns {Number}
 */
Date.prototype.dateDiff2 = function(pattern, time, dpattern) {
    return this.dateDiff(pattern, time.toDate(dpattern));
};
/***
 * 현재 Date 객체의 요일을 반환.
 * @returns {string}
 */
Date.prototype.dayOfWeek = function(){
    return GLB_DAY_IN_WEEK[this.getDay()];
};
/***
 * 현재 Date 객체의 년월의 마지막 날을 반환.
 *  @return : String
 */
Date.prototype.lastDay = function() {
    var yyyymm = this.format('YYYYMM');
    var yyyy = yyyymm.substring(0, 4) * 1;
    var mm = yyyymm.substring(4, 6) * 1;
    var end = new Array(31,28,31,30,31,30,31,31,30,31,30,31);
    if ((yyyy % 4 == 0 && yyyy % 100 != 0) || yyyy % 400 == 0) {
        end[1] = 29;
    }
    return end[mm];
};

/***
 * 현재 Date 객체의 년월의 첮째날짜을 반환.
 *  @return : String
 */
Date.prototype.firstDate = function() {
    return this.format('YYYYMM') + "01";
};

/***
 * 현재 Date 객체의 년월의 마지막 날짜을 반환.
 *  @return : String
 */
Date.prototype.lastDate = function() {
    var yyyymm = this.format('YYYYMM');
    var yyyy = yyyymm.substring(0, 4) * 1;
    var mm = yyyymm.substring(4, 6) * 1;
    var end = new Array(31,28,31,30,31,30,31,31,30,31,30,31);
    if ((yyyy % 4 == 0 && yyyy % 100 != 0) || yyyy % 400 == 0) {
        end[1] = 29;
    }
    return yyyymm+end[mm];
};

/*---------------------------------------------------------------------------------*
 * rndDate Object
 *---------------------------------------------------------------------------------*/
(function($) {
    $.date = {
        /***
         * 현재 시각을 Time 형식(날짜 문자열)으로 리턴
         * @param pattern
         */
        currdate: function (pattern) {
            return new Date().format(pattern);
        },
        /***
         * 유효한(존재하는) 월(月)인지 체크
         * @param mm
         * @returns {boolean}
         */
        isValidMonth: function (mm) {
            var m = parseInt(mm, 10);
            return (m >= 1 && m <= 12);
        },
        /***
         * 유효한(존재하는) 일(日)인지 체크
         * @param yyyy
         * @param mm
         * @param dd
         * @returns {boolean}
         */
        isValidDay: function (yyyy, mm, dd) {
            var m = parseInt(mm, 10) - 1;
            var d = parseInt(dd, 10);
            var end = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
            if ((yyyy % 4 == 0 && yyyy % 100 != 0) || yyyy % 400 == 0) {
                end[1] = 29;
            }
            return (d >= 1 && d <= end[m]);
        },
        /***
         * 유효한(존재하는) 시(時)인지 체크
         * @param hh
         * @returns {boolean}
         */
        isValidHour: function (hh) {
            var h = parseInt(hh, 10);
            return (h >= 1 && h <= 24);
        },
        /***
         * 유효한(존재하는) 분(分)인지 체크
         * @param mi
         * @returns {boolean}
         */
        isValidMin: function (mi) {
            var m = parseInt(mi, 10);
            return (m >= 1 && m <= 60);
        },
        /***
         * 날짜 문자열 길이에 따른 유효성 체크
         * @param time
         * @returns {*}
         */
        isValidTime: function (time) {
            var years, months, days, hours, mins;
            try {
                years = time.substring(0, 4);
                months = time.substring(4, 6);
                days = time.substring(6, 8);
                hours = time.substring(8, 10);
                mins = time.substring(10, 12);
            } catch (e) {
            }
            switch (time.length) {
                case 4 :
                    return parseInt(years, 10) >= 1900;
                    break;
                case 6 :
                    return this.isValidMonth(months);
                    break;
                case 8 :
                    return this.isValidDay(years, months, days);
                    break;
                case 10:
                    return this.isValidHour(hours);
                    break;
                case 12:
                    return this.isValidMin(mins);
                    break;
                default:
                    return false;
                    break;
            }
        },
        /***
         * 날짜 문자열 길이에 따른 유효성 체크
         * @param v
         * @returns {boolean}
         */
        isValidDate: function (v) {
            var currVal = v;
            if (currVal == '') {
                return false;
            }
            var rxDatePattern = /^(\d{4})(\/|-){0,1}(\d{2})(\/|-){0,1}(\d{2})$/;
            var dtArray = currVal.match(rxDatePattern);
            if (dtArray == null) {
                return false;
            }
            var dtYear = dtArray[1];
            var dtMonth = dtArray[3];
            var dtDay = dtArray[5];
            if (dtMonth < 1 || dtMonth > 12) {
                return false;
            }
            else if (dtDay < 1 || dtDay > 31) {
                return false;
            }
            else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31) {
                return false;
            }
            else if (dtMonth == 2) {
                var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
                if (dtDay > 29 || (dtDay == 29 && !isleap)) {
                    return false;
                }
            }
            return true;
        },
        /***
         * Time이 현재시각 이후(미래)인지 체크
         * @param time
         * @param pattern
         * @returns {boolean}
         */
        isAfterTime: function (time, pattern) {
            return (time.toDate(pattern) > new Date());
        },
        /***
         * Time이 현재시각 이전(과거)인지 체크
         * @param time
         * @param pattern
         * @returns {boolean}
         */
        isBeforeTime: function (time, pattern) {
            return (time.toDate(pattern) < new Date());
        }
    }
})(jQuery);