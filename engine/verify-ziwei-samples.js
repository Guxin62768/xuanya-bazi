const E=require('/tmp/zw/engine-ziwei-v1.js');
const GAN=E.GAN,ZHI=E.ZHI;
function n10(n){return ((n%10)+10)%10;}function n12(n){return ((n%12)+12)%12;}
function gzOfYin(yearGan, zhi){ // 由寅起年干顺排求某地支宫干
  const g0=GAN.indexOf(E.WUHU[yearGan]);
  const off=n12(ZHI.indexOf(zhi)-2);
  return GAN[n10(g0+off)]+zhi;
}
// 7 样本：年干 + 命宫地支 + 四化（禄/权/科/忌）
// 注：四化需从各盘“哪个星化了何”反推，这里我们核“年干对应四化星名”是否与样本一致
const samples=[
 {id:'boss',yg:'戊',mingZhi:'未',si:{禄:'贪狼',权:'太阴',科:'右弼',忌:'天机'}},
 {id:'son', yg:'乙',mingZhi:'丑',si:null},
 {id:'s3',  yg:'乙',mingZhi:'丑',si:null},
 {id:'s4',  yg:'癸',mingZhi:'申',si:{禄:'破军',权:'巨门',科:'太阴',忌:'贪狼'}},
 {id:'s5',  yg:'甲',mingZhi:'丑',si:{禄:'廉贞',权:'破军',科:'武曲',忌:'太阳'}},
 {id:'s6',  yg:'戊',mingZhi:'丑',si:{禄:'贪狼',权:'太阴',科:'右弼',忌:'天机'}},
 {id:'s7',  yg:'庚',mingZhi:'寅',si:{禄:'太阳',权:'武曲',科:'太阴',忌:'天同'}},
];
let pass=0,fail=0;
samples.forEach(s=>{
  const expected=gzOfYin(s.yg,s.mingZhi);
  // 命宫宫干（用宫干支校验）：即该命宫地支应有的宫干
  console.log(s.id+' 年干'+s.yg+' 命宫('+s.mingZhi+') 应宫干='+expected);
  // 四化核对
  if(s.si){ const t=E.SIHUA[s.yg]; const ok=t&&t.禄===s.si.禄&&t.权===s.si.权&&t.科===s.si.科&&t.忌===s.si.忌; console.log('   四化:', ok?'✅吻合':'❌不符 '+JSON.stringify(t)); if(ok)pass++;else fail++; }
});
console.log('四化通过:',pass,'失败:',fail);
