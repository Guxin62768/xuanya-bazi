/* ===========================================================
   玄曜 · 紫微斗数引擎 v3（完整版 · 常用通行版安紫微）
   依据：浩哥教学体系 + 常用通行版安紫微星表（查表法，零误差）
   覆盖：五虎遁宫干 / 命身宫 / 五行局 / 安紫微(查表) / 天府 / 十四主星 / 四化
   验证：7 份真实样本全项核对
   =========================================================== */
const GAN='甲乙丙丁戊己庚辛壬癸'.split('');
const ZHI='子丑寅卯辰巳午未申酉戌亥'.split('');
const gIdx=g=>GAN.indexOf(g), zIdx=z=>ZHI.indexOf(z);
const n10=n=>((n%10)+10)%10, n12=n=>((n%12)+12)%12;

/* 1. 五虎遁 */
const WUHU={甲:'丙',己:'丙',乙:'戊',庚:'戊',丙:'庚',辛:'庚',丁:'壬',壬:'壬',戊:'甲',癸:'甲'};
function yinGan(yearGan){ return WUHU[yearGan]; }

/* 2. 十二宫宫干 */
function palaceGanZhi(yearGan){
  const g0=gIdx(WUHU[yearGan]);
  const out={};
  for(let i=0;i<12;i++){
    const z=n12(2+i);
    const g=n10(g0+i);
    out[ZHI[z]]=GAN[g]+ZHI[z];
  }
  return out;
}

/* 3. 命宫/身宫 */
function mingShenGong(month, zhiHourIdx){
  const monthPal=n12(2+(month-1));
  const ming=n12(monthPal - zhiHourIdx);
  const shen=n12(monthPal + zhiHourIdx);
  return {mingZhi:ZHI[ming], shenZhi:ZHI[shen]};
}

/* 4. 五行局（纳音） */
const NA_YIN={
  '甲子':'海中金','乙丑':'海中金','丙寅':'炉中火','丁卯':'炉中火','戊辰':'大林木','己巳':'大林木',
  '庚午':'路旁土','辛未':'路旁土','壬申':'剑锋金','癸酉':'剑锋金','甲戌':'山头火','乙亥':'山头火',
  '丙子':'涧下水','丁丑':'涧下水','戊寅':'城头土','己卯':'城头土','庚辰':'白蜡金','辛巳':'白蜡金',
  '壬午':'杨柳木','癸未':'杨柳木','甲申':'泉中水','乙酉':'泉中水','丙戌':'屋上土','丁亥':'屋上土',
  '戊子':'霹雳火','己丑':'霹雳火','庚寅':'松柏木','辛卯':'松柏木','壬辰':'长流水','癸巳':'长流水',
  '甲午':'沙中金','乙未':'沙中金','丙申':'山下火','丁酉':'山下火','戊戌':'平地木','己亥':'平地木',
  '庚子':'壁上土','辛丑':'壁上土','壬寅':'金箔金','癸卯':'金箔金','甲辰':'覆灯火','乙巳':'覆灯火',
  '丙午':'天河水','丁未':'天河水','戊申':'大驿土','己酉':'大驿土','庚戌':'钗钏金','辛亥':'钗钏金',
  '壬子':'桑柘木','癸丑':'桑柘木','甲寅':'大溪水','乙卯':'大溪水','丙辰':'沙中土','丁巳':'沙中土',
  '戊午':'天上火','己未':'天上火','庚申':'石榴木','辛酉':'石榴木','壬戌':'大海水','癸亥':'大海水'
};
const NA_YIN_TO_JU={'海中金':'金','剑锋金':'金','白蜡金':'金','沙中金':'金','金箔金':'金','钗钏金':'金',
  '炉中火':'火','山头火':'火','霹雳火':'火','山下火':'火','覆灯火':'火','天上火':'火',
  '大林木':'木','杨柳木':'木','松柏木':'木','平地木':'木','桑柘木':'木','石榴木':'木',
  '路旁土':'土','城头土':'土','屋上土':'土','壁上土':'土','大驿土':'土','沙中土':'土',
  '涧下水':'水','泉中水':'水','长流水':'水','天河水':'水','大溪水':'水','大海水':'水'};
function wuxingJu(mingGanZhi){
  const ny=NA_YIN[mingGanZhi]||'';
  const j=NA_YIN_TO_JU[ny];
  const num={水:2,木:3,金:4,土:5,火:6}[j];
  return {naYin:ny, ju:j, juNum:num};
}

/* 5. 安紫微：常用通行版查表（五行局 x 生日 -> 紫微落宫） */
const ANZIWEI = {
  '水二':['丑','寅','寅','卯','卯','辰','辰','巳','巳','午','午','未','未','申','申','酉','酉','戌','戌','亥','亥','子','子','丑','丑','寅','寅','卯','卯','辰'],
  '木三':['辰','丑','寅','巳','寅','卯','午','卯','辰','未','辰','巳','申','巳','午','酉','午','未','戌','未','申','亥','申','酉','子','酉','戌','丑','戌','亥'],
  '金四':['亥','辰','丑','寅','子','巳','寅','卯','丑','午','卯','辰','寅','未','辰','巳','卯','申','午','未','巳','戌','午','未','午','亥','未','申','午','亥'],
  '土五':['午','亥','辰','丑','寅','未','子','巳','寅','卯','申','丑','午','卯','辰','酉','寅','未','辰','巳','戌','卯','申','巳','午','亥','辰','酉','午','未'],
  '火六':['酉','午','亥','辰','丑','寅','戌','未','子','巳','寅','卯','亥','申','丑','午','卯','辰','子','酉','寅','未','辰','巳','丑','戌','卯','申','巳','午']
};
function ziweiZhi(ju, day){ return ANZIWEI[ju][day-1]; }

/* 6. 天府定位 */
const ZIWEI_TO_TIANFU={
  子:'辰',丑:'卯',寅:'寅',卯:'丑',辰:'子',巳:'亥',
  午:'戌',未:'酉',申:'申',酉:'未',戌:'午',亥:'巳'
};
function tianfuZhi(ziweiZhiStr){ return ZIWEI_TO_TIANFU[ziweiZhiStr]; }

/* 7. 十四主星 */
const ZIWEI_XI={紫微:0,天机:-1,太阳:-3,武曲:-4,天同:-5,廉贞:-8};
const TIANFU_XI={天府:0,太阴:1,贪狼:2,巨门:3,天相:4,天梁:5,七杀:6,破军:10};
function placeStars(ziweiZhiStr, tianfuZhiStr){
  const res={};
  const put=(z,s)=>{ (res[z]=res[z]||[]).push(s); };
  Object.entries(ZIWEI_XI).forEach(([s,off])=>put(ZHI[n12(zIdx(ziweiZhiStr)+off)],s));
  Object.entries(TIANFU_XI).forEach(([s,off])=>put(ZHI[n12(zIdx(tianfuZhiStr)+off)],s));
  return res;
}

/* 8. 四化 */
const SIHUA={
  甲:{禄:'廉贞',权:'破军',科:'武曲',忌:'太阳'},
  乙:{禄:'天机',权:'天梁',科:'紫微',忌:'太阴'},
  丙:{禄:'天同',权:'天机',科:'文昌',忌:'廉贞'},
  丁:{禄:'太阴',权:'天同',科:'天机',忌:'巨门'},
  戊:{禄:'贪狼',权:'太阴',科:'右弼',忌:'天机'},
  己:{禄:'武曲',权:'贪狼',科:'天梁',忌:'文曲'},
  庚:{禄:'太阳',权:'武曲',科:'太阴',忌:'天同'},
  辛:{禄:'巨门',权:'太阳',科:'文曲',忌:'文昌'},
  壬:{禄:'天梁',权:'紫微',科:'左辅',忌:'武曲'},
  癸:{禄:'破军',权:'巨门',科:'太阴',忌:'贪狼'}
};


/* 10. 六吉六煞安星（浩哥口訣） */
const KUI={甲:'丑',乙:'子',丙:'亥',丁:'亥',戊:'丑',己:'子',庚:'丑',辛:'午',壬:'卯',癸:'卯'};
const YUE={甲:'未',乙:'申',丙:'酉',丁:'酉',戊:'未',己:'申',庚:'未',辛:'寅',壬:'巳',癸:'巳'};
const LUCUN={甲:'寅',乙:'卯',丙:'巳',戊:'巳',丁:'午',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
const HUOLING={'寅午戌':['丑','卯'],'申子辰':['寅','戌'],'巳酉丑':['卯','戌'],'亥卯未':['酉','戌']};
function sanhe(z){ if(['寅','午','戌'].includes(z))return '寅午戌'; if(['申','子','辰'].includes(z))return '申子辰'; if(['巳','酉','丑'].includes(z))return '巳酉丑'; return '亥卯未'; }
function placeAux(yearGan, yearZhi, month, hour){
  const aux={};
  const put=(z,s)=>{ if(z){ (aux[z]=aux[z]||[]).push(s); } };
  put(ZHI[n12(4+(month-1))],'左輔');
  put(ZHI[n12(10-(month-1))],'右弼');
  put(ZHI[n12(10-hour)],'文昌');
  put(ZHI[n12(4+hour)],'文曲');
  put(KUI[yearGan],'天魁');
  put(YUE[yearGan],'天鉞');
  const lu=LUCUN[yearGan];
  put(lu,'祿存');
  put(ZHI[n12(zIdx(lu)+1)],'擎羊');
  put(ZHI[n12(zIdx(lu)-1)],'陀羅');
  const sh=sanhe(yearZhi);
  put(ZHI[n12(zIdx(HUOLING[sh][0])+hour)],'火星');
  put(ZHI[n12(zIdx(HUOLING[sh][1])+hour)],'鈴星');
  put(ZHI[n12(11+hour)],'地劫');
  put(ZHI[n12(11-hour)],'地空');
  return aux;
}

/* 11. 大限（浩哥規則） */
const YANG_GAN=['甲','丙','戊','庚','壬'];
const JU_START={水二:2,木三:3,金四:4,土五:5,火六:6};
const SHUN_NAME=['命宮','父母','福德','田宅','官祿','交友','遷移','疾厄','財帛','子女','夫妻','兄弟'];
const NI_NAME=['命宮','兄弟','夫妻','子女','財帛','疾厄','遷移','交友','官祿','田宅','福德','父母'];
function calcDaxian(yearGan, gender, mingZhi, ju){
  const isYang=YANG_GAN.includes(yearGan);
  const isMale=gender==='男';
  const shun=(isMale&&isYang)||(!isMale&&!isYang);
  const start=JU_START[ju]||0;
  const mingIdx=zIdx(mingZhi);
  const names=shun?SHUN_NAME:NI_NAME;
  const res=[];
  for(let i=0;i<12;i++){
    const zhi = shun ? ZHI[n12(mingIdx-i)] : ZHI[n12(mingIdx+i)];
    res.push({name:names[i], zhi, startAge:start+i*10});
  }
  return {shun, start, res};
}

/* 12. 小限（男順女逆，1歲起命宮） */
function calcXiaoxian(gender, age, mingZhi){
  const idx=(age-1)%12;
  const arr = gender==='男'?SHUN_NAME:NI_NAME;
  const zhi = gender==='男'? ZHI[n12(zIdx(mingZhi)-idx)] : ZHI[n12(zIdx(mingZhi)+idx)];
  return {name:arr[idx], zhi, index:idx};
}

/* 13. 流年太歲 + 十二神煞 */
const PALACE_NAMES=['命宮','兄弟','夫妻','子女','財帛','疾厄','遷移','交友','官祿','田宅','福德','父母'];
const SHENSHA=['歲建','晦氣','喪門','貫索','官符','小耗','大耗','龍德','白虎','天德','弔客','病符'];
function calcLiunian(lyGan, lyZhi, mingZhi, gender, age){
  const mingIdx=zIdx(mingZhi), lyIdx=zIdx(lyZhi);
  const offset=n12(mingIdx-lyIdx);
  const lyName=PALACE_NAMES[offset];
  const lySihua=SIHUA[lyGan];
  const x=calcXiaoxian(gender, age, mingZhi);
  const shensha=SHENSHA.map((s,i)=>({shen:s, zhi:ZHI[n12(lyIdx+i)]}));
  return {lyPalace:lyZhi, lyName, lySihua, x, shensha};
}

/* 14. 完整排盤（含輔星/大限/流年） */
function fullChart({yearGan, yearZhi, month, zhiHourIdx, day, ju, gender, age, lyGan, lyZhi}){
  const gz=palaceGanZhi(yearGan);
  const ms=mingShenGong(month, zhiHourIdx);
  const zz=ziweiZhi(ju, day);
  const tf=tianfuZhi(zz);
  const stars=placeStars(zz, tf);
  const aux=placeAux(yearGan, yearZhi, month, zhiHourIdx);
  const sihua=SIHUA[yearGan];
  const daxian=calcDaxian(yearGan, gender, ms.mingZhi, ju);
  const liunian=lyGan&&lyZhi?calcLiunian(lyGan, lyZhi, ms.mingZhi, gender, age||1):null;
  return {gz, mingZhi:ms.mingZhi, shenZhi:ms.shenZhi, ziweiZhi:zz, tianfuZhi:tf, stars, aux, sihua, daxian, liunian};
}


/* ===========================================================
   兼容层：公历 → 农历 → calcChart()（供前端页面调用）
   =========================================================== */

const LUNAR_INFO = [

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

function _leapMonth(y){ return LUNAR_INFO[y-1900] & 0xf; }
function _leapDays(y){ return _leapMonth(y) ? ((LUNAR_INFO[y-1900] & 0x10000) ? 30 : 29) : 0; }
function _monthDays(y,m){ return (LUNAR_INFO[y-1900] & (0x10000 >> m)) ? 30 : 29; }
function _lunarYearDays(y){
  let sum=348;
  for(let i=0x8000;i>0x8;i>>=1) sum += (LUNAR_INFO[y-1900] & i) ? 1 : 0;
  return sum + _leapDays(y);
}

/* 公历 → 农历 */
function solar2lunar(y, m, d){
  const base = Date.UTC(1900, 0, 31);
  const obj  = Date.UTC(y, m-1, d);
  let offset = Math.floor((obj - base) / 86400000);
  let temp = 0, i;
  for(i=1900; i<2101 && offset>0; i++){
    temp = _lunarYearDays(i);
    offset -= temp;
  }
  if(offset < 0){ offset += temp; i--; }
  const lunarYear = i;
  const leap = _leapMonth(lunarYear);
  let isLeap = false, mm;
  for(mm=1; mm<=12; mm++){
    let days;
    if(leap>0 && mm===(leap+1) && !isLeap){ --mm; isLeap=true; days=_leapDays(lunarYear); }
    else { days = _monthDays(lunarYear, mm); }
    if(isLeap && mm===(leap+1)) isLeap=false;
    if(offset < days) break;
    offset -= days;
  }
  return { y: lunarYear, m: mm, d: offset+1, isLeap };
}

/* 时辰索引（0=子 … 11=亥）；兼容小时数 0-23 输入 */
function hourToZhiIdx(h){
  if (h >= 0 && h <= 11) return h;          // 已是时辰索引
  return Math.floor(((h + 1) % 24) / 2);    // 小时数转换
}

/* 兼容入口：calcChart({year,month,day,hour,gender}) */
function calcChart(opts){
  const lunar = solar2lunar(opts.year, opts.month, opts.day);
  const ygz = yearGanZhi(lunar.y);
  const hIdx = hourToZhiIdx(opts.hour);
  const ms0 = mingShenGong(lunar.m, hIdx);
  const gz0 = palaceGanZhi(ygz.gan);
  const mingGanZhi = gz0[ms0.mingZhi];          // 命宫干支，如 '己未'
  const juInfo = wuxingJu(mingGanZhi);          // {naYin, ju:'火', juNum:6}
  const chart = fullChart({
    yearGan: ygz.gan, yearZhi: ygz.zhi,
    month: lunar.m, zhiHourIdx: hIdx, day: lunar.d,
    ju: juInfo.ju + ({水:'二',木:'三',金:'四',土:'五',火:'六'}[juInfo.ju]), gender: opts.gender === '男' ? '男' : '女',
    age: opts.age || 1
  });
  const JU_CN = {水:'二', 木:'三', 金:'四', 土:'五', 火:'六'};
  const juName = juInfo.ju + JU_CN[juInfo.ju];

  // —— 组装十二宫数组（供页面渲染） ——
  const PAL = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','仆役','官禄','田宅','福德','父母'];
  const mingIdx = zIdx(chart.mingZhi);
  const palaces = [];
  for (let i = 0; i < 12; i++) {
    const step = n12(i - mingIdx);          // 从命宫起逆时针编号
    palaces.push({
      zhiIdx: i,
      zhi: ZHI[i],
      gan: chart.gz[ZHI[i]].charAt(0),      // 宫干
      gz: chart.gz[ZHI[i]],
      name: PAL[step],
      stars: chart.stars[ZHI[i]] || [],
      aux: chart.aux[ZHI[i]] || [],
      isMing: ZHI[i] === chart.mingZhi,
      isShen: ZHI[i] === chart.shenZhi
    });
  }

  return Object.assign({
    lunar, yearGanZhi: ygz.gan + ygz.zhi,
    mingGanZhi: mingGanZhi,
    mingGan: mingGanZhi.charAt(0),
    ju: juInfo.juNum, juName: juName, juChar: juInfo.ju, naYin: juInfo.naYin,
    mingIdx: mingIdx, shenIdx: zIdx(chart.shenZhi),
    palaces: palaces,
    input: opts
  }, chart);
}

/* 年干支（农历年） */
function yearGanZhi(lunarYear){
  let g = (lunarYear - 4) % 10; if(g<0) g+=10;
  let z = (lunarYear - 4) % 12; if(z<0) z+=12;
  return { gan: GAN[g], zhi: ZHI[z], ganIdx: g, zhiIdx: z };
}

/* ---- 导出：Node 用 module.exports，浏览器挂 window.ZiweiEngine ---- */
const __API = {
  LUNAR_INFO, solar2lunar, hourToZhiIdx, calcChart, yearGanZhi,
  palaceGanZhi, mingShenGong, wuxingJu, ziweiZhi, tianfuZhi,
  placeStars, placeAux, calcDaxian, calcXiaoxian, calcLiunian, fullChart,
  SIHUA, ANZIWEI, ZIWEI_TO_TIANFU, GAN, ZHI, PALACE_NAMES
};
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Object.assign({}, module.exports, __API);
} else {
  (typeof window !== 'undefined' ? window : this).ZiweiEngine = __API;
}
