/* ===========================================================
   玄曜 · 紫微斗数引擎 v1（第一步：宫干/命宫/五行局/四化/十四主星）
   依据：浩哥教学体系（五虎遁→顺排→命宫→五行局→紫微/天府→星系布星→四化）
   验证样本：7 份真实盘（fixtures/*.json）
   说明：安紫微表仅有样本锁定点，完整表待补；未锁处不臆造。
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
  const g0=gIdx(WUHU[yearGan]); // 寅宫天干
  const out={}; // 地支 -> 干支
  for(let i=0;i<12;i++){
    const z=n12(2+i);        // 从寅(z=2)顺行
    const g=n10(g0+i);
    out[ZHI[z]]=GAN[g]+ZHI[z];
  }
  return out;
}

/* 3. 命宫 / 身宫：寅起正月顺至生月；从该宫起子时，命宫逆数、身宫顺数至生时 */
function mingShenGong(month, zhiHourIdx){ // zhiHourIdx: 子=0..亥=11
  const monthPal=n12(2+(month-1));           // 生月落宫（寅起正月顺）
  const ming=n12(monthPal - zhiHourIdx);     // 逆数到生时 → 命宫
  const shen=n12(monthPal + zhiHourIdx);     // 顺数到生时 → 身宫
  return {mingZhi:ZHI[ming], shenZhi:ZHI[shen]};
}

/* 4. 四化表（年干 → 禄/权/科/忌 各主星） */
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

/* 5. 紫微星系（相对紫微宫，按口诀逆排；偏移以“紫微=0”表示） */
const ZIWEI_XI={紫微:0,天机:-1,太阳:-3,武曲:-4,天同:-5,廉贞:-8};
/* 6. 天府星系（相对天府宫，顺排） */
const TIANFU_XI={天府:0,太阴:1,贪狼:2,巨门:3,天相:4,天梁:5,七杀:6,破军:10}; // 破军=空三后

/* 7. 由“紫微宫地支”布十四主星（天府=紫微的对宫规则：若知天府位可直接用） */
function placeStars(ziweiZhi, tianfuZhi){
  const res={}; // 地支 -> [星]
  const put=(z,s)=>{ (res[z]=res[z]||[]).push(s); };
  Object.entries(ZIWEI_XI).forEach(([s,off])=>put(ZHI[n12(zIdx(ziweiZhi)+off)],s));
  Object.entries(TIANFU_XI).forEach(([s,off])=>put(ZHI[n12(zIdx(tianfuZhi)+off)],s));
  return res;
}

module.exports={GAN,ZHI,WUHU,palaceGanZhi,mingShenGong,SIHUA,ZIWEI_XI,TIANFU_XI,placeStars};
