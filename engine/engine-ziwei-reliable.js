/* =========================================================
   玄曜 Stage B（可靠公共算法）
   - 干支工具、十二宫序、寅正月模型（命宫定位的“寅宫起正月”基础）
   说明：本环境未具备专业紫微命盘对照，以下仅实现确定性数字推理；下表层面
         (五行局/紫微星定位/辅曜/四化) 另行在 stageB-tables-TODO.js 待权威表复核
   ========================================================= */
const GZ='甲 乙 丙 丁 戊 己 庚 辛 壬 癸'.split(' ');
const ZRL='子 丑 寅 卯 辰 巳 午 未 申 酉 戌 亥'.split(' ');
const idxZ={子:0,丑:1,寅:2,卯:3,辰:4,巳:5,午:6,未:7,申:8,酉:9,戌:10,亥:11};
const idxG={甲:0,乙:1,丙:2,丁:3,戊:4,己:5,庚:6,辛:7,壬:8,癸:9};
const nrm12=(x)=>((x%12)+12)%12;
function gzOf(gz){return GZ[idxG[gz[0]]] + ZRL[nrm12((idxZ[gz[1]]))];}
/* 安身：由“寅”起正月顺数到生月所在;再从此位“顺数/逆数”到时支依男女性别不同 */
/* 命（月）宫：由酉亥 两法取……此处先提供“月支定位”：寅起正月顺行12宫得到“月宫” */
function monthPalace(mon){ return nrm12(2+mon-1); } // 2=寅(0-based)
/* hour: 0..23 ; hour group 亥=21? 用子=0: (h==23?0:h+1) */
function hzIdx(hour){ const h=hour===23?0:(hour+1); return Math.floor(h/2); }
module.exports={ZRL,idxZ,idxG,monthPalace,hzIdx, nrm12};
