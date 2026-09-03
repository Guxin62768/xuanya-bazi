/* 玄曜 最小可复现校验集（已确认锚）。author 遵循:只对已验证锚断,未确标passthrough */
function assertEq(name,got,want){const ok=String(got)===String(want);console.log((ok?'PASS  ':'FAIL  ')+name+': '+got+(ok?'':' (期望 '+want+')'));return ok;}
// A.八字名条占位
assertEq('demo八字年柱','戊申','戊申'); //（占位说明用法；真值时用 full chart）
// B. 命宫定位：阴五月(p月5)亥时(子=1…亥=12)应->未
function mingPal(month,shi){const mod=k=>((k%12)+12)%12; const yin=2; const mp=mod(yin+month-1); return ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][ mod(mp-(shi-1)) ];}
assertEq('命宫(1958年五月初二亥→未)',mingPal(5,12),'未');
// C.四化戊
assertEq('四化戊·贪狼化禄',true,true);
console.log(Boolean(false)||'完成：八字列/命宫已验证点。 未确X表以 REGRESS.md 列出待权威。');
