const E=require('./engine/engine-ziwei-v2.js');
const {GAN,ZHI}=E;

/* === boss 盘全项验证（锚） ===
   boss: 戊申年(年干戊) 五月初二 亥时(11) 火六局
   已验证真值: 命宫未(己未) 紫微午 天府戌 十四主星14/14 四化戊=贪狼禄/太阴权/右弼科/天机忌
*/
const boss=E.fullChart({yearGan:'戊', month:5, zhiHourIdx:11, day:2, ju:'火六'});
console.log('--- boss 盘验证 ---');
console.log('命宫地支:', boss.mingZhi, '(期望未)', boss.mingZhi==='未'?'✅':'❌');
console.log('身宫地支:', boss.shenZhi, '(期望巳)', boss.shenZhi==='巳'?'✅':'❌');
console.log('紫微:', boss.ziweiZhi, '(期望午)', boss.ziweiZhi==='午'?'✅':'❌');
console.log('天府:', boss.tianfuZhi, '(期望戌)', boss.tianfuZhi==='戌'?'✅':'❌');

// 十四主星期望（boss 盘）
const expect={
  午:['紫微'], 巳:['天机'], 卯:['太阳','天梁'], 寅:['武曲','天相'],
  丑:['天同','巨门'], 戌:['廉贞','天府'], 亥:['太阴'], 子:['贪狼'],
  辰:['七杀'], 申:['破军']
};
let starOk=true;
for(const [z,stars] of Object.entries(expect)){
  const got=(boss.stars[z]||[]).slice().sort().join(',');
  const want=stars.slice().sort().join(',');
  if(got!==want){ starOk=false; console.log(`  ${z}: 期望[${want}] 实际[${got}] ❌`); }
}
console.log('十四主星:', starOk?'14/14 全吻合 ✅':'有差异 ❌');

// 四化
const eh={禄:'贪狼',权:'太阴',科:'右弼',忌:'天机'};
console.log('四化(戊):', JSON.stringify(boss.sihua), JSON.stringify(eh), JSON.stringify(boss.sihua)===JSON.stringify(eh)?'✅':'❌');

// 宫干：boss 命宫=己未
console.log('命宫干支:', boss.gz['未'], '(期望己未)', boss.gz['未']==='己未'?'✅':'❌');

/* === s5 盘（水二局 25日，民间表应丑） === */
const s5=E.ziweiZhi('水二',25);
console.log('\n--- s5 水二局25日 ---');
console.log('紫微:', s5, '(期望丑)', s5==='丑'?'✅':'❌');

/* === 完整民间表抽样核对 === */
console.log('\n--- 民间表抽样核对 ---');
const checks=[['火六',2,'午'],['水二',25,'丑'],['木三',9,'戌'],['金四',10,'子'],['土五',9,'子'],['火六',27,'未']];
checks.forEach(([ju,d,want])=>{
  const got=E.ziweiZhi(ju,d);
  console.log(`${ju}${d}日: 算得${got} 期望${want}`, got===want?'✅':'❌');
});
