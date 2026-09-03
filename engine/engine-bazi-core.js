/* =========================================================
   玄曜 · Stage A：八字核心引擎（浏览端）
   提供：排盘(四柱/十神/五行/强弱/喜用/大运) + 基础解读
   后续 B~E 阶段接入紫微/易经
   ========================================================= */
const GAN=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const WX=['木','火','土','金','水'];
const GA={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
const ZW={子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
const CANG={子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],辰:['戊','乙','癸'],巳:['丙','庚','戊'],午:['丁','己'],未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],戌:['戊','辛','丁'],亥:['壬','甲']};
const SHENG={木:'火',火:'土',土:'金',金:'水',水:'木'};
const KE={木:'土',土:'水',水:'火',火:'金',金:'木'};
const YY={甲:1,丙:1,戊:1,庚:1,壬:1,乙:0,丁:0,己:0,辛:0,癸:0};

// 由公历/农历取 lunar 对象（浏览器引入 lunar.js；Node 环境用注入的 Solar/Lunar）
function requireSolar(){ if(typeof Solar!=='undefined')return Solar; }
function toLunar(bType,y,mo,d,h,mi){ if(bType==='solar')return Solar.fromYmdHms(y,mo,d,h,mi,0).getLunar(); return Lunar.fromYmdHms(y,mo,d,h,mi,0); }

// 十神
function shiShen(myGan,oGan){let a=GA[myGan],b=GA[oGan],s=YY[myGan]===YY[oGan];let r;if(a===b)r='同';else if(SHENG[a]===b)r='我生';else if(SHENG[b]===a)r='生我';else if(KE[a]===b)r='我克';else if(KE[b]===a)r='克我';else r='';
  const map={同:(s?'比肩':'劫财'),'我生':(s?'食神':'伤官'),'生我':(s?'偏印':'正印'),'我克':(s?'偏财':'正财'),'克我':(s?'七杀':'正官')};return map[r]||'';}
// 五行加权
function wuxingBal(ec){let c={木:0,火:0,土:0,金:0,水:0},w=[1,.7,.4];const gs=[ec.getYearGan(),ec.getMonthGan(),ec.getDayGan(),ec.getTimeGan()];const zs=[ec.getYearZhi(),ec.getMonthZhi(),ec.getDayZhi(),ec.getTimeZhi()];
  gs.forEach(g=>c[GA[g]]++);zs.forEach(z=>CANG[z].forEach((g,i)=>c[GA[g]]+=w[i]));return c;}
// 强弱
function strength(ec){const dg=ec.getDayGan(),mw=GA[dg],c=wuxingBal(ec);let supp=c[mw]+c[SHENG[mw]],drain=c[KE[mw]]+c[KE[SHENG[mw]]]+c[SHENG[SHENG[mw]]],sc=supp-drain;
  if(ZW[ec.getMonthZhi()]===mw||SHENG[ZW[ec.getMonthZhi()]]===mw)sc+=2;
  [ec.getYearZhi(),ec.getMonthZhi(),ec.getDayZhi(),ec.getTimeZhi()].forEach(z=>{if(CANG[z][0]===mw)sc+=1.5;});
  let lv,strong;if(sc>=6){strong=true;lv='身强'}else if(sc>=2){strong=true;lv='偏强'}else if(sc<=-6){strong=false;lv='身弱'}else if(sc<=-2){strong=false;lv='偏弱'}else{strong=sc>=0;lv='中和'}return {strong,mw,level:lv,count:c};}
// 喜用
function xiyong(ec,st){let L=st.strong?[KE[st.mw],SHENG[st.mw]]:[SHENG[st.mw],st.mw];return [...new Set(L.filter(w=>typeof w==='string'&&w))];}

// 供 browser/H5、逻辑可测
if(typeof module!=='undefined')module.exports={GAN,ZHI,WX,shiShen,wuxingBal,strength,xiyong};
