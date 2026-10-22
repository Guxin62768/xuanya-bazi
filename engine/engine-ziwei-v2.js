/* ============================================================
   紫微斗数引擎 v2  (纯 JS，无依赖)
   体系：民间顺行速查表（水二起丑、木三起寅、金四起卯、土五起辰、火六起巳）
   ============================================================ */
(function (root) {
  'use strict';

  // ---------- 基础常量 ----------
  var GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  // 地支序号：子0 丑1 寅2 卯3 辰4 巳5 午6 未7 申8 酉9 戌10 亥11

  var GAN_YINYANG = { 甲:'阳', 乙:'阴', 丙:'阳', 丁:'阴', 戊:'阳', 己:'阴', 庚:'阳', 辛:'阴', 壬:'阳', 癸:'阴' };
  var GAN_WUXING  = { 甲:'木', 乙:'木', 丙:'火', 丁:'火', 戊:'土', 己:'土', 庚:'金', 辛:'金', 壬:'水', 癸:'水' };
  var ZHI_WUXING  = { 子:'水', 丑:'土', 寅:'木', 卯:'木', 辰:'土', 巳:'火', 午:'火', 未:'土', 申:'金', 酉:'金', 戌:'土', 亥:'水' };

  // 十二宫名（顺时针，从命宫起逆时针布宫，此处按地支序固定名称由命宫推算）
  var PALACE_NAMES = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','仆役','官禄','田宅','福德','父母'];

  // ---------- 干支历（简化版：公历→农历） ----------
  // 农历数据表 1900-2100（每年一个 32bit：前4位闰月，其余为12/13个月大小）
  var LUNAR_INFO = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,//1900-1909
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,//1910-1919
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,//1920-1929
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,//1930-1939
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,//1940-1949
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,//1950-1959
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,//1960-1969
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,//1970-1979
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,//1980-1989
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,//1990-1999
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,//2000-2009
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,//2010-2019
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,//2020-2029
    0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,//2030-2039
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0 //2040-2049
  ];

  function leapMonth(y) { return LUNAR_INFO[y-1900] & 0xf; }
  function leapDays(y) { return leapMonth(y) ? ((LUNAR_INFO[y-1900] & 0x10000) ? 30 : 29) : 0; }
  function monthDays(y, m) { return (LUNAR_INFO[y-1900] & (0x10000 >> m)) ? 30 : 29; }

  // 公历 → 农历（返回 {y,m,d,isLeap}）
  function solar2lunar(y, m, d) {
    // 以 1900-01-31 为农历 1900 年正月初一
    var baseDate = Date.UTC(1900, 0, 31);
    var objDate = Date.UTC(y, m - 1, d);
    var offset = Math.floor((objDate - baseDate) / 86400000);
    var temp = 0, i;
    for (i = 1900; i < 2101 && offset > 0; i++) {
      temp = (i - 1900 < LUNAR_INFO.length) ? ((i % 4 === 0) ? 366 : 365) : 365;
      // 农历年实际天数
      temp = lunarYearDays(i);
      offset -= temp;
    }
    if (offset < 0) { offset += temp; i--; }
    var lunarYear = i;
    var leap = leapMonth(lunarYear);
    var isLeap = false;
    var lunarMonth = 1;
    for (var mm = 1; mm <= 12; mm++) {
      var days;
      if (leap > 0 && mm === (leap + 1) && !isLeap) {
        --mm; isLeap = true; days = leapDays(lunarYear);
      } else { days = monthDays(lunarYear, mm); }
      if (isLeap && mm === (leap + 1)) isLeap = false;
      if (offset < days) break;
      offset -= days;
    }
    lunarMonth = mm;
    var lunarDay = offset + 1;
    return { y: lunarYear, m: lunarMonth, d: lunarDay, isLeap: isLeap };
  }

  function lunarYearDays(y) {
    var sum = 348, i;
    for (i = 0x8000; i > 0x8; i >>= 1) sum += (LUNAR_INFO[y-1900] & i) ? 1 : 0;
    return sum + leapDays(y);
  }

  // 年干支（以农历年为准，index 0=甲子）
  function yearGanZhi(lunarYear) {
    var g = (lunarYear - 4) % 10;
    var z = (lunarYear - 4) % 12;
    if (g < 0) g += 10;
    if (z < 0) z += 12;
    return { gan: GAN[g], zhi: ZHI[z], ganIdx: g, zhiIdx: z };
  }

  // ---------- 纳音五行 → 五行局 ----------
  // 60甲子纳音表
  var NAYIN = [
    '海中金','炉中火','大林木','路旁土','剑锋金','山头火','涧下水','城头土','白蜡金','杨柳木',
    '泉中水','屋上土','霹雳火','松柏木','长流水','沙中金','山下火','平地木','壁上土','金箔金',
    '覆灯火','天河水','大驿土','钗钏金','桑柘木','大溪水','沙中土','天上火','石榴木','大海水'
  ];
  function nayinOfGanZhi(ganIdx, zhiIdx) {
    // 由干支序求 60甲子序
    var jiazi = -1;
    for (var i = 0; i < 60; i++) {
      if (i % 10 === ganIdx && i % 12 === zhiIdx) { jiazi = i; break; }
    }
    if (jiazi < 0) return null;
    return NAYIN[Math.floor(jiazi / 2)];
  }
  // 纳音 → 局数（水二/木三/金四/土五/火六）
  function juFromNayin(nayin) {
    if (!nayin) return null;
    if (nayin.indexOf('水') >= 0) return 2;
    if (nayin.indexOf('木') >= 0) return 3;
    if (nayin.indexOf('金') >= 0) return 4;
    if (nayin.indexOf('土') >= 0) return 5;
    if (nayin.indexOf('火') >= 0) return 6;
    return null;
  }

  // ---------- 五虎遁（年干 → 寅宫天干） ----------
  // 甲己之年丙作首，乙庚之岁戊为头，丙辛必定寻庚起，丁壬壬位顺行流，戊癸何方发，甲寅之上好追求
  var WUHU = { 甲:'丙', 己:'丙', 乙:'戊', 庚:'戊', 丙:'庚', 辛:'庚', 丁:'壬', 壬:'壬', 戊:'甲', 癸:'甲' };

  // 由年干求某地支宫的天干（寅宫起 WUHU，顺排）
  function palaceGan(yearGan, zhiIdx) {
    var yinGan = WUHU[yearGan];
    var yinGanIdx = GAN.indexOf(yinGan);   // 寅宫天干
    var yinZhiIdx = ZHI.indexOf('寅');     // =2
    var step = ((zhiIdx - yinZhiIdx) % 12 + 12) % 12;
    var g = (yinGanIdx + step) % 10;
    return GAN[g];
  }

  // ---------- 命宫 / 身宫 ----------
  // 命宫：寅起正月，顺数至生月；再从生月宫起子时，逆数至生时
  function findMingGong(lunarMonth, hourZhiIdx) {
    // 正月在寅(2)，顺数至生月
    var monthPalace = ((2 + (lunarMonth - 1)) % 12 + 12) % 12; // 生月所在宫地支序
    // 从生月宫起子时，逆数至生时
    var ming = ((monthPalace - hourZhiIdx) % 12 + 12) % 12;
    return ming;
  }
  // 身宫：从生月宫起子时，顺数至生时
  function findShenGong(lunarMonth, hourZhiIdx) {
    var monthPalace = ((2 + (lunarMonth - 1)) % 12 + 12) % 12;
    var shen = ((monthPalace + hourZhiIdx) % 12 + 12) % 12;
    return shen;
  }

  // ---------- 安紫微（民间顺行速查表） ----------
  // 水二起丑(1)、木三起寅(2)、金四起卯(3)、土五起辰(4)、火六起巳(5)
  var ZIWEI_START = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };
  function findZiwei(ju, lunarDay) {
    var start = ZIWEI_START[ju];
    if (start === undefined) return null;
    return ((start + (lunarDay - 1)) % 12 + 12) % 12;
  }

  // 天府 = 紫微 的对宫偏移（紫微寅→天府寅；紫微卯→天府丑…）
  // 规律：天府与紫微关于「寅-申」轴对称 → 天府序 = (4 - 紫微序 + 12) % 12 ？用标准表
  // 实际：紫微在寅(2)→天府在寅(2)；紫微在卯(3)→天府在丑(1)；紫微在辰(4)→天府在子(0)；
  //      紫微在巳(5)→天府在亥(11)；紫微在午(6)→天府在戌(10)；紫微在未(7)→天府在酉(9)；
  //      紫微在申(8)→天府在申(8)；紫微在酉(9)→天府在未(7)；紫微在戌(10)→天府在午(6)；
  //      紫微在亥(11)→天府在巳(5)；紫微在子(0)→天府在辰(4)；紫微在丑(1)→天府在卯(3)
  var TIANFU_MAP = { 2:2, 3:1, 4:0, 5:11, 6:10, 7:9, 8:8, 9:7, 10:6, 11:5, 0:4, 1:3 };
  function findTianfu(ziweiIdx) { return TIANFU_MAP[ziweiIdx]; }

  // ---------- 十四主星布星 ----------
  // 紫微系（逆时针）：紫微、天机(逆1)、太阳(逆3)、武曲(逆4)、天同(逆5)、廉贞(逆8)
  var ZIWEI_SERIES = [
    { name:'紫微', off:-0 }, { name:'天机', off:-1 }, { name:'太阳', off:-3 },
    { name:'武曲', off:-4 }, { name:'天同', off:-5 }, { name:'廉贞', off:-8 }
  ];
  // 天府系（顺时针）：天府、太阴(顺1)、贪狼(顺2)、巨门(顺3)、天相(顺4)、天梁(顺5)、七杀(顺6)、破军(顺10)
  var TIANFU_SERIES = [
    { name:'天府', off:0 }, { name:'太阴', off:1 }, { name:'贪狼', off:2 }, { name:'巨门', off:3 },
    { name:'天相', off:4 }, { name:'天梁', off:5 }, { name:'七杀', off:6 }, { name:'破军', off:10 }
  ];

  function placeStars(ziweiIdx, tianfuIdx) {
    var stars = {}; // zhiIdx -> [names]
    for (var i = 0; i < 12; i++) stars[i] = [];
    ZIWEI_SERIES.forEach(function (s) {
      var idx = ((ziweiIdx + s.off) % 12 + 12) % 12;
      stars[idx].push(s.name);
    });
    TIANFU_SERIES.forEach(function (s) {
      var idx = ((tianfuIdx + s.off) % 12 + 12) % 12;
      stars[idx].push(s.name);
    });
    return stars;
  }

  // ---------- 四化 ----------
  var SIHUA = {
    甲: { 禄:'廉贞', 权:'破军', 科:'武曲', 忌:'太阳' },
    乙: { 禄:'天机', 权:'天梁', 科:'紫微', 忌:'太阴' },
    丙: { 禄:'天同', 权:'天机', 科:'文昌', 忌:'廉贞' },
    丁: { 禄:'太阴', 权:'天同', 科:'天机', 忌:'巨门' },
    戊: { 禄:'贪狼', 权:'太阴', 科:'右弼', 忌:'天机' },
    己: { 禄:'武曲', 权:'贪狼', 科:'天梁', 忌:'文曲' },
    庚: { 禄:'太阳', 权:'武曲', 科:'太阴', 忌:'天同' },
    辛: { 禄:'巨门', 权:'太阳', 科:'文曲', 忌:'文昌' },
    壬: { 禄:'天梁', 权:'紫微', 科:'左辅', 忌:'武曲' },
    癸: { 禄:'破军', 权:'巨门', 科:'太阴', 忌:'贪狼' }
  };

  // ---------- 主函数：排一张盘 ----------
  function calcChart(opts) {
    // opts: {year, month, day, hour, gender}
    var lunar = solar2lunar(opts.year, opts.month, opts.day);
    var hourZhiIdx = opts.hour % 12;

    var ygz = yearGanZhi(lunar.y);

    // 命宫宫干 = 年干五虎遁 该地支宫的天干
    var mingIdx = findMingGong(lunar.m, hourZhiIdx);
    var shenIdx = findShenGong(lunar.m, hourZhiIdx);

    // 五行局：由命宫天干 + 命宫地支 纳音
    var mingGan = palaceGan(ygz.gan, mingIdx);
    var mingGanIdx = GAN.indexOf(mingGan);
    var nayin = nayinOfGanZhi(mingGanIdx, mingIdx);
    var ju = juFromNayin(nayin);

    var ziweiIdx = findZiwei(ju, lunar.d);
    var tianfuIdx = findTianfu(ziweiIdx);
    var starMap = placeStars(ziweiIdx, tianfuIdx);

    var sihua = SIHUA[ygz.gan] || null;

    // 十二宫
    var palaces = [];
    for (var i = 0; i < 12; i++) {
      // 宫名：从命宫起逆时针（命宫、兄弟、夫妻…）
      var step = ((i - mingIdx) % 12 + 12) % 12;
      palaces.push({
        zhiIdx: i,
        zhi: ZHI[i],
        gan: palaceGan(ygz.gan, i),
        name: PALACE_NAMES[step],
        stars: starMap[i],
        isMing: i === mingIdx,
        isShen: i === shenIdx
      });
    }

    return {
      input: opts,
      lunar: lunar,
      yearGanZhi: ygz.gan + ygz.zhi,
      mingGan: mingGan,
      mingZhi: ZHI[mingIdx],
      nayin: nayin,
      ju: ju,
      juName: (function(){ var n={2:'水二局',3:'木三局',4:'金四局',5:'土五局',6:'火六局'}; return n[ju] || '?'; })(),
      ziweiZhi: ZHI[ziweiIdx],
      tianfuZhi: ZHI[tianfuIdx],
      ziweiIdx: ziweiIdx,
      tianfuIdx: tianfuIdx,
      mingIdx: mingIdx,
      shenIdx: shenIdx,
      sihua: sihua,
      palaces: palaces
    };
  }

  var api = {
    calcChart: calcChart,
    solar2lunar: solar2lunar,
    yearGanZhi: yearGanZhi,
    GAN: GAN, ZHI: ZHI,
    SIHUA: SIHUA,
    ZIWEI_START: ZIWEI_START,
    findZiwei: findZiwei,
    findTianfu: findTianfu,
    findMingGong: findMingGong,
    findShenGong: findShenGong,
    palaceGan: palaceGan,
    placeStars: placeStars,
    PALACE_NAMES: PALACE_NAMES
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ZiweiEngine = api;

})(typeof window !== 'undefined' ? window : this);
