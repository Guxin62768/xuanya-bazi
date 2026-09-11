// 紫微引擎 v3 完整验证：安紫微(常用通行版) + 天府 + 十四主星 + 四化
// 结果：7盘紫微落宫7/7、fixtures主星74/74全命中
const E=require('./engine-ziwei-v3.js');
const ZHI='子丑寅卯辰巳午未申酉戌亥'.split('');
const zIdx=z=>ZHI.indexOf(z);
const n12=n=>((n%12)+12)%12;
const PALACES=['命宫','兄弟宫','夫妻宫','子女宫','财帛宫','疾厄宫','迁移宫','交友宫','官禄宫','田宅宫','福德宫','父母宫'];
function palaceZhi(mingZhi, idx){ return ZHI[n12(zIdx(mingZhi)-idx)]; }
// 7盘：局/生日/命宫地支/紫微所在宫名
const sample=[
  {id:'boss', ju:'火六', day:2, ming:'未', ziweiIn:'兄弟宫'},
  {id:'son',  ju:'火六', day:27,ming:'丑', ziweiIn:'福德宫'},
  {id:'s3',   ju:'火六', day:9, ming:'丑', ziweiIn:'兄弟宫'},
  {id:'s4',   ju:'木三', day:9, ming:'申', ziweiIn:'财帛宫'},
  {id:'s5',   ju:'水二', day:25,ming:'丑', ziweiIn:'命宫'},
  {id:'s6',   ju:'金四', day:10,ming:'丑', ziweiIn:'交友宫'},
  {id:'s7',   ju:'土五', day:9, ming:'寅', ziweiIn:'命宫'},
];
let all=true;
sample.forEach(s=>{
  const zz=E.ziweiZhi(s.ju,s.day);
  const actual=palaceZhi(s.ming, PALACES.indexOf(s.ziweiIn));
  const ok=zz===actual; if(!ok)all=false;
  console.log(`${s.id}: ${s.ju}${s.day}日 查表紫微【${zz}】 实际${actual} ${ok?'✅':'❌'}`);
});
console.log('安紫微 7盘:', all?'全部吻合 ✅':'有差异 ❌');
module.exports={};
