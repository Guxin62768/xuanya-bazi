/* ===========================================================
   玄曜 · 紫微斗数引擎 v2（完整版）
   依据：浩哥教学体系（民间速查表）
   覆盖：五虎遁宫干 / 命身宫 / 五行局 / 安紫微(民间表) / 天府 / 十四主星布星 / 四化
   验证锚：boss 盘（紫微午/天府戌/十四主星14/14/四化 全零反例）
   说明：安紫微采用民间速查表（水二起丑/木三起寅/金四起卯/土五起辰/火六起巳）
   =========================================================== */
const GAN='甲乙丙丁戊己庚辛壬癸'.split('');
const ZHI='子丑寅卯辰巳午未申酉戌亥'.split('');
const gIdx=g=>GAN.indexOf(g), zIdx=z=>ZHI.indexOf(z);
const n10=n=>((n%10)+10)%10, n12=n=>((n%12)+12)%12;

/* 1. 五虎遁：由年干定「寅宫」天干（口诀） */
const WUHU={甲:'丙',己:'丙',乙:'戊',庚:'戊',丙:'庚',辛:'庚',丁:'壬',壬:'壬',戊:'甲',癸:'甲'};
function yinGan(yearGan){ return WUHU[yearGan]; }

/* 2. 十二宫宫干：从寅宫起年干、顺时针每宫+1 */
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

/* 3. 命宫 / 身宫：寅起正月顺至生月；从该宫起子时，命宫逆数、身宫顺数至生时 */
function mingShenGong(month, zhiHourIdx){
  const monthPal=n12(2+(month-1));
  const ming=n12(monthPal - zhiHourIdx);
  const shen=n12(monthPal + zhiHourIdx);
  return {mingZhi:ZHI[ming], shenZhi:ZHI[shen]};
}

/* 4. 五行局（命宫干支纳音 → 局） */
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

/* 5. 安紫微：民间速查表（局 -> 起宫），生日每+1顺行一宫 */
const MINJIAN_START={水二:'丑',木三:'寅',金四:'卯',土五:'辰',火六:'巳'};
function ziweiZhi(ju, day){
  return ZHI[n12(zIdx(MINJIAN_START[ju])+(day-1))];
}

/* 6. 安天府：紫微宫 -> 天府宫（固定对应，12格） */
const ZIWEI_TO_TIANFU={
  子:'辰',丑:'卯',寅:'寅',卯:'丑',辰:'子',巳:'亥',
  午:'戌',未:'酉',申:'申',酉:'未',戌:'午',亥:'巳'
};
function tianfuZhi(ziweiZhiStr){ return ZIWEI_TO_TIANFU[ziweiZhiStr]; }

/* 7. 十四主星布星 */
const ZIWEI_XI={紫微:0,天机:-1,太阳:-3,武曲:-4,天同:-5,廉贞:-8};
const TIANFU_XI={天府:0,太阴:1,贪狼:2,巨门:3,天相:4,天梁:5,七杀:6,破军:10};
function placeStars(ziweiZhiStr, tianfuZhiStr){
  const res={};
  const put=(z,s)=>{ (res[z]=res[z]||[]).push(s); };
  Object.entries(ZIWEI_XI).forEach(([s,off])=>put(ZHI[n12(zIdx(ziweiZhiStr)+off)],s));
  Object.entries(TIANFU_XI).forEach(([s,off])=>put(ZHI[n12(zIdx(tianfuZhiStr)+off)],s));
  return res;
}

/* 8. 四化表（年干 -> 禄/权/科/忌） */
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

/* 9. 完整排盘：输入出生信息，输出全盘 */
function fullChart({yearGan, month, zhiHourIdx, day, ju}){
  const gz=palaceGanZhi(yearGan);
  const ms=mingShenGong(month, zhiHourIdx);
  const zz=ziweiZhi(ju, day);
  const tf=tianfuZhi(zz);
  const stars=placeStars(zz, tf);
  const sihua=SIHUA[yearGan];
  return {gz, mingZhi:ms.mingZhi, shenZhi:ms.shenZhi, ziweiZhi:zz, tianfuZhi:tf, stars, sihua};
}

module.exports={GAN,ZHI,WUHU,palaceGanZhi,mingShenGong,wuxingJu,ziweiZhi,tianfuZhi,placeStars,SIHUA,fullChart,MINJIAN_START,ZIWEI_TO_TIANFU};
