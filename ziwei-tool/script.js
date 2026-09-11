/* ===========================================================
   玄曜 · 紫微斗數命盤 排盤引擎 + 渲染
   依據：常用通行版安紫微表（V3 引擎）
   =========================================================== */
(function(){
"use strict";

/* ---------- 基礎 ---------- */
const GAN='甲乙丙丁戊己庚辛壬癸'.split('');
const ZHI='子丑寅卯辰巳午未申酉戌亥'.split('');
const gIdx=g=>GAN.indexOf(g), zIdx=z=>ZHI.indexOf(z);
const n10=n=>((n%10)+10)%10, n12=n=>((n%12)+12)%12;

/* 1. 五虎遁 */
const WUHU={甲:'丙',己:'丙',乙:'戊',庚:'戊',丙:'庚',辛:'庚',丁:'壬',壬:'壬',戊:'甲',癸:'甲'};

/* 2. 十二宮宮干 */
function palaceGanZhi(yearGan){
  const g0=gIdx(WUHU[yearGan]);
  const out={};
  for(let i=0;i<12;i++){
    const z=n12(2+i), g=n10(g0+i);
    out[ZHI[z]]=GAN[g]+ZHI[z];
  }
  return out;
}

/* 3. 命宮/身宮 */
function mingShenGong(month, zhiHourIdx){
  const monthPal=n12(2+(month-1));
  const ming=n12(monthPal - zhiHourIdx);
  const shen=n12(monthPal + zhiHourIdx);
  return {mingZhi:ZHI[ming], shenZhi:ZHI[shen]};
}

/* 4. 五行局（納音） */
const NA_YIN={
  '甲子':'海中金','乙丑':'海中金','丙寅':'爐中火','丁卯':'爐中火','戊辰':'大林木','己巳':'大林木',
  '庚午':'路旁土','辛未':'路旁土','壬申':'劍鋒金','癸酉':'劍鋒金','甲戌':'山頭火','乙亥':'山頭火',
  '丙子':'澗下水','丁丑':'澗下水','戊寅':'城頭土','己卯':'城頭土','庚辰':'白蠟金','辛巳':'白蠟金',
  '壬午':'楊柳木','癸未':'楊柳木','甲申':'泉中水','乙酉':'泉中水','丙戌':'屋上土','丁亥':'屋上土',
  '戊子':'霹靂火','己丑':'霹靂火','庚寅':'松柏木','辛卯':'松柏木','壬辰':'長流水','癸巳':'長流水',
  '甲午':'沙中金','乙未':'沙中金','丙申':'山下火','丁酉':'山下火','戊戌':'平地木','己亥':'平地木',
  '庚子':'壁上土','辛丑':'壁上土','壬寅':'金箔金','癸卯':'金箔金','甲辰':'覆燈火','乙巳':'覆燈火',
  '丙午':'天河水','丁未':'天河水','戊申':'大驛土','己酉':'大驛土','庚戌':'釵釧金','辛亥':'釵釧金',
  '壬子':'桑柘木','癸丑':'桑柘木','甲寅':'大溪水','乙卯':'大溪水','丙辰':'沙中土','丁巳':'沙中土',
  '戊午':'天上火','己未':'天上火','庚申':'石榴木','辛酉':'石榴木','壬戌':'大海水','癸亥':'大海水'
};
const NA_YIN_TO_JU={'海中金':'金','劍鋒金':'金','白蠟金':'金','沙中金':'金','金箔金':'金','釵釧金':'金',
  '爐中火':'火','山頭火':'火','霹靂火':'火','山下火':'火','覆燈火':'火','天上火':'火',
  '大林木':'木','楊柳木':'木','松柏木':'木','平地木':'木','桑柘木':'木','石榴木':'木',
  '路旁土':'土','城頭土':'土','屋上土':'土','壁上土':'土','大驛土':'土','沙中土':'土',
  '澗下水':'水','泉中水':'水','長流水':'水','天河水':'水','大溪水':'水','大海水':'水'};
function wuxingJu(mingGanZhi){
  const ny=NA_YIN[mingGanZhi]||'';
  const j=NA_YIN_TO_JU[ny];
  const name=(j?j:(ny?'':''))+'';
  const num=({水:2,木:3,金:4,土:5,火:6}[j])||0;
  return {naYin:ny, ju:j, juName:name+num+'局', juNum:num};
}

/* 5. 安紫微：常用通行版查表 */
const ANZIWEI = {
  '水二':['丑','寅','寅','卯','卯','辰','辰','巳','巳','午','午','未','未','申','申','酉','酉','戌','戌','亥','亥','子','子','丑','丑','寅','寅','卯','卯','辰'],
  '木三':['辰','丑','寅','巳','寅','卯','午','卯','辰','未','辰','巳','申','巳','午','酉','午','未','戌','未','申','亥','申','酉','子','酉','戌','丑','戌','亥'],
  '金四':['亥','辰','丑','寅','子','巳','寅','卯','丑','午','卯','辰','寅','未','辰','巳','卯','申','午','未','巳','戌','午','未','午','亥','未','申','午','亥'],
  '土五':['午','亥','辰','丑','寅','未','子','巳','寅','卯','申','丑','午','卯','辰','酉','寅','未','辰','巳','戌','卯','申','巳','午','亥','辰','酉','午','未'],
  '火六':['酉','午','亥','辰','丑','寅','戌','未','子','巳','寅','卯','亥','申','丑','午','卯','辰','子','酉','寅','未','辰','巳','丑','戌','卯','申','巳','午']
};
function ziweiZhi(ju, day){ return ANZIWEI[ju][day-1]; }

/* 6. 天府定位 */
const ZIWEI_TO_TIANFU={子:'辰',丑:'卯',寅:'寅',卯:'丑',辰:'子',巳:'亥',午:'戌',未:'酉',申:'申',酉:'未',戌:'午',亥:'巳'};
function tianfuZhi(zz){ return ZIWEI_TO_TIANFU[zz]; }

/* 7. 十四主星 */
const ZIWEI_XI={紫微:0,天機:-1,太陽:-3,武曲:-4,天同:-5,廉貞:-8};
const TIANFU_XI={天府:0,太陰:1,貪狼:2,巨門:3,天相:4,天梁:5,七殺:6,破軍:10};
function placeStars(zz, tf){
  const res={};
  const put=(z,s)=>{ (res[z]=res[z]||[]).push(s); };
  Object.entries(ZIWEI_XI).forEach(([s,off])=>put(ZHI[n12(zIdx(zz)+off)],s));
  Object.entries(TIANFU_XI).forEach(([s,off])=>put(ZHI[n12(zIdx(tf)+off)],s));
  return res;
}

/* 8. 四化 */
const SIHUA={
  甲:{祿:'廉貞',權:'破軍',科:'武曲',忌:'太陽'},
  乙:{祿:'天機',權:'天梁',科:'紫微',忌:'太陰'},
  丙:{祿:'天同',權:'天機',科:'文昌',忌:'廉貞'},
  丁:{祿:'太陰',權:'天同',科:'天機',忌:'巨門'},
  戊:{祿:'貪狼',權:'太陰',科:'右弼',忌:'天機'},
  己:{祿:'武曲',權:'貪狼',科:'天梁',忌:'文曲'},
  庚:{祿:'太陽',權:'武曲',科:'太陰',忌:'天同'},
  辛:{祿:'巨門',權:'太陽',科:'文曲',忌:'文昌'},
  壬:{祿:'天梁',權:'紫微',科:'左輔',忌:'武曲'},
  癸:{祿:'破軍',權:'巨門',科:'太陰',忌:'貪狼'}
};



/* 9. 十二宮名稱（命宮起，逆時針） */
const PALACE_NAMES=['命宮','兄弟','夫妻','子女','財帛','疾厄','遷移','交友','官祿','田宅','福德','父母'];

/* 10. 六吉六煞安星（浩哥提供口訣） */
const KUI={甲:'丑',乙:'子',丙:'亥',丁:'亥',戊:'丑',己:'子',庚:'丑',辛:'午',壬:'卯',癸:'卯'};
const YUE={甲:'未',乙:'申',丙:'酉',丁:'酉',戊:'未',己:'申',庚:'未',辛:'寅',壬:'巳',癸:'巳'};
const LUCUN={甲:'寅',乙:'卯',丙:'巳',戊:'巳',丁:'午',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
const HUOLING={'寅午戌':['丑','卯'],'申子辰':['寅','戌'],'巳酉丑':['卯','戌'],'亥卯未':['酉','戌']};
function sanhe(z){ if(['寅','午','戌'].includes(z))return '寅午戌'; if(['申','子','辰'].includes(z))return '申子辰'; if(['巳','酉','丑'].includes(z))return '巳酉丑'; return '亥卯未'; }
function placeAux(yearGan, yearZhi, month, hour){
  const aux={}; // 地支->[星]
  const put=(z,s)=>{ if(z){ (aux[z]=aux[z]||[]).push(s); } };
  // 六吉
  put(ZHI[n12(4+(month-1))],'左輔');      // 左輔辰順月
  put(ZHI[n12(10-(month-1))],'右弼');     // 右弼戌逆月
  put(ZHI[n12(10-hour)],'文昌');          // 文昌戌逆時
  put(ZHI[n12(4+hour)],'文曲');           // 文曲辰順時
  put(KUI[yearGan],'天魁');
  put(YUE[yearGan],'天鉞');
  // 祿存 + 擎羊陀羅
  const lu=LUCUN[yearGan];
  put(lu,'祿存');
  put(ZHI[n12(zIdx(lu)+1)],'擎羊');
  put(ZHI[n12(zIdx(lu)-1)],'陀羅');
  // 火鈴（年支三合）
  const sh=sanhe(yearZhi);
  put(ZHI[n12(zIdx(HUOLING[sh][0])+hour)],'火星');
  put(ZHI[n12(zIdx(HUOLING[sh][1])+hour)],'鈴星');
  // 空劫
  put(ZHI[n12(11+hour)],'地劫');          // 地劫亥順時
  put(ZHI[n12(11-hour)],'地空');           // 地空亥逆時
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
  const shun=(isMale&&isYang)||(!isMale&&!isYang); // 陽男陰女順行
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

/* 12. 流年太歲 + 小限（浩哥規則） */
function calcLiunian(lyGan, lyZhi, mingZhi, gender, age){
  // 流年太歲：以流年支定位命盤對應宮（地支即宮位）
  const lyPalace = lyZhi; // 流年太歲落宮 = 流年支地支
  // 該流年宮是命盤哪一宮（從命宮逆時針數到該地支）
  const mingIdx=zIdx(mingZhi), lyIdx=zIdx(lyZhi);
  const offset=n12(mingIdx-lyIdx); // 命宮到流年宮逆時針步數
  const lyName=PALACE_NAMES[offset];
  // 流年干四化
  const lySihua=SIHUA[lyGan];
  // 小限：男順女逆，1歲起命宮
  const xIdx=(age-1)%12;
  const xNameArr = gender==='男'?SHUN_NAME:NI_NAME;
  const xZhiRaw = gender==='男'? ZHI[n12(mingIdx-xIdx)] : ZHI[n12(mingIdx+xIdx)];
  const xName=xNameArr[xIdx];
  return {lyPalace, lyName, lySihua, xZhi:xZhiRaw, xName, xIndex:xIdx};
}

/* 13. 命宮主星斷語（通用中性，文化參考） */
const STAR_DESC={
  '紫微':'帝座之星，主貴氣與領導力，格局高者具統御之才',
  '天機':'智慧之星，主思辨與機變，善謀略而多動',
  '太陽':'光明之星，主名聲與付出，熱忱坦蕩',
  '武曲':'財星，主剛毅與執行，行事果斷務實',
  '天同':'福星，主安逸與隨和，性溫厚知足',
  '廉貞':'次桃花星，主才藝與權變，性烈而有主見',
  '天府':'庫星，主穩重與積蓄，善守成而寬厚',
  '太陰':'田宅主，主內斂與細膩，性溫柔善感',
  '貪狼':'桃花星，主才藝與慾望，交際廣而多變',
  '巨門':'暗星，主口才與是非，善言辭而多思',
  '天相':'印星，主輔佐與協調，性溫和守規',
  '天梁':'蔭星，主清高與庇護，性正直而老成',
  '七殺':'將星，主威嚴與開創，性剛烈而果決',
  '破軍':'耗星，主變動與開拓，性衝動而敢為'
};

/* 14. 十二宮主題（流年宮位斷語用） */
const PALACE_THEME={
  '命宮':'一生格局與性格之樞紐',
  '兄弟':'手足緣分與平輩助力',
  '夫妻':'婚姻感情與配偶關係',
  '子女':'子嗣緣分與晚輩',
  '財帛':'財祿進出與理財方式',
  '疾厄':'健康體質與潛在隱憂',
  '遷移':'外出際遇與環境變動',
  '交友':'人際往來與合作夥伴',
  '官祿':'事業發展與社會地位',
  '田宅':'房產積蓄與家庭根基',
  '福德':'精神享受與福分根基',
  '父母':'長上緣分與早年環境'
};
const STAR_KEY={
  '紫微':'主貴', '天機':'主智', '太陽':'主名', '武曲':'主財', '天同':'主福',
  '廉貞':'主權變', '天府':'主守成', '太陰':'主田宅', '貪狼':'主才藝', '巨門':'主口舌',
  '天相':'主協調', '天梁':'主庇蔭', '七殺':'主開創', '破軍':'主變動'
};
const SI_HUA_DESC={
  '祿':'當年生旺、緣分增進，易得助力或順遂',
  '權':'當年主導性增強，利於掌權、擔責、推進',
  '科':'當年名聲彰顯，利於文名、聲望、貴人提攜',
  '忌':'當年需多留意，防其對應領域的困擾或執著'
};
const SS_DESC={
  '歲建':'本命太歲，主當年根基與整體氣運，宜穩重行事',
  '晦氣':'主情緒低落、易有悶氣，宜多開解、少計較',
  '喪門':'主家中長輩或親友之事，宜多關心、防意外',
  '貫索':'主牽絆、糾纏，宜謹言慎行、防口舌是非',
  '官符':'主官司、文書、是非，宜守法守規、防訴訟',
  '小耗':'主小破財、小耗損，宜節制開支、防遺失',
  '大耗':'主較大破耗、損財，宜謹慎理財、防大額支出',
  '龍德':'主貴人、吉祥，逢之多得助力、諸事順遂',
  '白虎':'主血光、爭鬥、壓力，宜防意外、保平安',
  '天德':'主天賜福澤、化解凶厄，逢之多有庇佑',
  '弔客':'主弔喪、探病之事，宜注意健康、少涉喪事',
  '病符':'主小病、體弱，宜注意養生、防微恙'
};
const MINGZHU={子:'貪狼',丑:'巨門',寅:'祿存',卯:'文曲',辰:'廉貞',巳:'武曲',午:'破軍',未:'武曲',申:'廉貞',酉:'文曲',戌:'祿存',亥:'巨門'};
const SHENZHU={子:'火星',丑:'天相',寅:'天梁',卯:'天同',辰:'文昌',巳:'天機',午:'天鉞',未:'天相',申:'天梁',酉:'天同',戌:'文昌',亥:'天機'};

/* 星曜組合斷語（中性） */
const COMBO_DESC={
  '紫微天府':'帝星入庫，格局高貴，主掌權而有守成之象',
  '紫微破軍':'帝星遇破，主破舊立新、開創格局，動中有貴',
  '紫微貪狼':'桃花帝星，主才華交際，早發而須防誘惑',
  '天機巨門':'智謀口舌，主善謀斷而多思慮',
  '太陽太陰':'日月同宮，主貴人緣而陰陽調和，惟較辛勞',
  '武曲貪狼':'財帛桃花，主求財敏捷而交際廣',
  '武曲破軍':'財星遇破，主財波動大，宜敢於開創',
  '武曲七殺':'財星遇殺，主財權兼具，宜防急進',
  '廉貞貪狼':'雙桃花，主才華風流，感情須專一',
  '廉貞七殺':'才華遇殺，主魄力強而行事果決',
  '天同巨門':'福星遇暗，主福祿而多口舌之累',
  '天同天梁':'福蔭雙全，主安逸有庇護，晚年福厚'
};
const STAR_HUJI_DESC={
  '紫微':'帝星化忌，主貴氣受抑，須防權勢受挫、孤高',
  '天機':'機星化忌，主思慮過度，防神經緊張、決斷失誤',
  '太陽':'日星化忌，主名聲受損，防付出無功、親長之憂',
  '武曲':'財星化忌，主財務波動，防投資失利、破耗',
  '天同':'福星化忌，主安逸受擾，防懶散誤事',
  '廉貞':'才星化忌，主才藝受阻，防感情是非、血光',
  '太陰':'月星化忌，主內斂受抑，防房產、母緣之憂',
  '貪狼':'桃花化忌，主慾望失控，防感情敗壞、耗損',
  '巨門':'暗星化忌，主口舌是非加劇，防官非、爭執',
  '天相':'輔星化忌，主協調失衡，防合作生變',
  '天梁':'蔭星化忌，主庇護受損，防長輩健康、官司',
  '七殺':'殺星化忌，主意外加劇，防血光、爭鬥',
  '破軍':'破星化忌，主變動失序，防突發破敗'
};

/* 財帛宮主星財富特質（中性參考） */
const FORTUNE_STAR={
  '紫微':'帝座坐財，主財祿根基穩固，格局高者能聚大財',
  '天機':'機變生財，主以智謀、機緣得財，宜靈活理財',
  '太陽':'名聲生財，主以名望、付出得財，利公職與聲譽之財',
  '武曲':'正財之星，主剛毅務實理財，利實業、投資',
  '天同':'福澤聚財，主安穩得財，利穩健儲蓄',
  '廉貞':'才藝生財，主以才藝、交際得財，但財來財去',
  '天府':'庫藏聚財，主積蓄守財，利置產保值',
  '太陰':'田宅主財，主以房產、內斂方式聚財',
  '貪狼':'偏財之星，主以交際、投資、投機得財，波動大',
  '巨門':'口舌生財，主以口才、專業得財，利顧問諮詢',
  '天相':'輔佐聚財，主以協調、合作得財，宜合夥',
  '天梁':'清高聚財，主以庇護、長輩提攜得財，財源穩定',
  '七殺':'開創生財，主以開拓、冒險得財，宜創業',
  '破軍':'變動生財，主財波動大，宜破而後立、敢於開創'
};
const GAN_WUXING={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
const ZHI_WUXING={子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
const NUM_WUXING={1:'水',2:'火',3:'木',4:'金',5:'土',6:'水',7:'火',8:'木',9:'金',0:'土'};

/* 疾厄宮主星健康特質（中性參考） */
const HEALTH_STAR={
  '紫微':'主貴氣，體質根基較穩，宜注意心血管與壓力',
  '天機':'主思慮，宜注意神經系統與睡眠、用腦過度',
  '太陽':'主心火，宜注意心臟、血壓與眼目',
  '武曲':'主金氣，宜注意肺、呼吸道與筋骨',
  '天同':'主福氣，體質多安逸，宜防過度慵懶與代謝',
  '廉貞':'主火氣，宜注意血液循環、婦科與情緒',
  '天府':'主庫藏，體質多穩健，宜注意消化與積累',
  '太陰':'主水氣，宜注意腎、泌尿與寒濕',
  '貪狼':'主慾望，宜注意肝膽、生殖與過度消耗',
  '巨門':'主口舌，宜注意脾胃、消化與口齒',
  '天相':'主輔佐，體質多平和，宜注意皮膚與過敏',
  '天梁':'主蔭護，有化解之能，宜注意肝膽與長者之疾',
  '七殺':'主剛烈，宜注意意外、筋骨與血光',
  '破軍':'主變動，宜注意突發之疾與新陳代謝'
};

/* 15. 公曆→農曆自動填盤（用 lunar.js） */
const TIME_ZHI=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
function solarToAll(sy, sm, sd, sh){
  if(typeof Solar==='undefined'){ alert('農曆庫加載失敗'); return null; }
  const sol=Solar.fromYmdHms(sy,sm,sd, sh*2, (sh*2+1)%24, 0);
  const lun=sol.getLunar();
  const yearGz=lun.getYearInGanZhi();
  const yearGan=yearGz[0], yearZhi=yearGz[1];
  const month=lun.getMonth(), day=lun.getDay();
  // 命宮 + 五行局
  const ms=mingShenGong(month, sh);
  const gzMap=palaceGanZhi(yearGan);
  const mingGZ=gzMap[ms.mingZhi];
  const wj=wuxingJu(mingGZ);
  const bazi=[
    {t:'年柱', gz:lun.getYearInGanZhi(), extra:'生肖'+lun.getYearShengXiao()},
    {t:'月柱', gz:lun.getMonthInGanZhi()},
    {t:'日柱', gz:lun.getDayInGanZhi()},
    {t:'時柱', gz:lun.getTimeInGanZhi()}
  ];
  return {yearGan, yearZhi, month, day, hour:sh, ju:wj.ju, juNum:wj.juNum, juName:wj.juName, naYin:wj.naYin, mingZhi:ms.mingZhi, mingGZ, bazi};
}
function applySolar(){
  const sy=parseInt(document.getElementById('sy').value,10);
  const sm=parseInt(document.getElementById('sm').value,10);
  const sd=parseInt(document.getElementById('sd').value,10);
  const sh=parseInt(document.getElementById('sh').value,10);
  // 同步性別
  const sg=document.getElementById('sg').value;
  document.getElementById('gender').value=sg;
  if(!sy||!sm||!sd){ alert('請填完整公曆生日'); return; }
  const r=solarToAll(sy,sm,sd,sh);
  if(!r) return;
  // 填入手動欄位
  document.getElementById('yearGan').value=r.yearGan;
  document.getElementById('yearZhi').value=r.yearZhi;
  document.getElementById('month').value=r.month;
  document.getElementById('day').value=r.day;
  document.getElementById('hour').value=r.hour;
  // 五行局：單字(火)+中文數(六) -> 下拉值(如 火六)
  const CN=['零','一','二','三','四','五','六'];
  if(r.ju && r.juNum){
    const juVal=r.ju+CN[r.juNum];
    if([...document.getElementById('ju').options].some(o=>o.value===juVal)){
      document.getElementById('ju').value=juVal;
    }
  }
  // 存八字供渲染
  window.__bazi=r.bazi||null;
  // 存出生信息
  window.__birth={sy,sm,sd,sg,sh};
  // URL 存參數（分享用）
  if(history.replaceState){
    const qs='?sy='+sy+'&sm='+sm+'&sd='+sd+'&sh='+sh+'&sg='+encodeURIComponent(sg);
    history.replaceState(null,'',qs);
  }
  render();
}

/* ---------- 渲染 ---------- */
function render(){
  const yearGan=document.getElementById('yearGan').value;
  const month=parseInt(document.getElementById('month').value,10);
  const hour=parseInt(document.getElementById('hour').value,10);
  const day=parseInt(document.getElementById('day').value,10);
  const ju=document.getElementById('ju').value;
  const yearZhi=document.getElementById('yearZhi').value;
  const gender=document.getElementById('gender').value;
  if(!day||day<1||day>30){ alert('請輸入農曆生日 1-30'); return; }

  // 計算
  const gzMap=palaceGanZhi(yearGan);
  const ms=mingShenGong(month, hour);
  const zz=ziweiZhi(ju, day);
  const tf=tianfuZhi(zz);
  const stars=placeStars(zz, tf);
  const aux=placeAux(yearGan, yearZhi, month, hour);
  const sihua=SIHUA[yearGan];
  // 命宮干支 + 五行局
  const mingGZ=gzMap[ms.mingZhi];
  const wj=wuxingJu(mingGZ);

  // 顯示面板
  document.getElementById('chartPanel').style.display='';
  document.getElementById('infoPanel').style.display='';
  document.getElementById('daxianPanel').style.display='';
  // 出生信息
  if(window.__birth){
    document.getElementById('birthInfo').textContent=window.__birth.sy+'年'+window.__birth.sm+'月'+window.__birth.sd+'日 · '+window.__birth.sg+'命';
  }
  // 八字四柱
  const bzPanel=document.getElementById('baziPanel');
  if(window.__bazi){
    bzPanel.style.display='';
    document.getElementById('baziGrid').innerHTML=window.__bazi.map((b,i)=>`<div class="bz-item"><span class="bz-t">${b.t}</span><span class="bz-gz">${b.gz}</span><span class="bz-extra">${b.extra||''}</span></div>`).join('');
  } else {
    bzPanel.style.display='none';
  }
  const tianLabel='紫微在'+zz;
  document.getElementById('tianLabel').textContent=tianLabel;
  document.getElementById('ziweiLabel').textContent='紫微 '+zz;

  // 大限
  const dx=calcDaxian(yearGan, gender, ms.mingZhi, ju);
  const currentAge=parseInt(document.getElementById('age').value,10)||1;
  const dxDesc=(dx.shun?'陽男/陰女順行':'陰男/陽女逆行')+' · '+wj.juName+'起運 '+dx.start+'歲';
  document.getElementById('daxianDesc').textContent=dxDesc;
  document.getElementById('daxianList').innerHTML=dx.res.map(l=>{
    const isCur = currentAge>=l.startAge && currentAge<=l.startAge+9;
    // 大限四化：用大限宮位天干查四化表
    const dxGz=gzMap[l.zhi];
    const dxGan=dxGz?dxGz[0]:'';
    const dxSihua=dxGan&&SIHUA[dxGan]?SIHUA[dxGan]:null;
    const dxSihuaStr=dxSihua?`<span class="dx-sihua">${dxSihua.祿}祿 ${dxSihua.權}權 ${dxSihua.科}科 ${dxSihua.忌}忌</span>`:'';
    return `<div class="dx-item${isCur?' dx-cur':''}"><span class="dx-age">${l.startAge}歲</span><span class="dx-name">${l.name} · ${l.zhi}${isCur?'<em class="dx-tag">當運</em>':''}</span>${dxSihuaStr}<span class="dx-range">${l.startAge}-${l.startAge+9}歲</span></div>`;
  }).join('');

  // 流年太歲 + 小限 + 十二神煞
  document.getElementById('liunianPanel').style.display='';
  const lyGan=document.getElementById('lyGan').value;
  const lyZhi=document.getElementById('lyZhi').value;
  const age=parseInt(document.getElementById('age').value,10)||1;
  const ln=calcLiunian(lyGan, lyZhi, ms.mingZhi, gender, age);
  const lySihuaStr='祿'+ln.lySihua.祿+' 權'+ln.lySihua.權+' 科'+ln.lySihua.科+' 忌'+ln.lySihua.忌;
  const sihuaGloss=Object.entries(ln.lySihua).map(([k,star])=>`${star}${k}：${SI_HUA_DESC[k]||''}`).join('；');
  document.getElementById('liunianResult').innerHTML=
    `<div class="ln-item"><span class="ln-label">流年太歲</span><span class="ln-val">${lyGan}${lyZhi}年 · ${ln.lyName}（${lyZhi}宮）</span></div>`+
    `<div class="ln-item"><span class="ln-label">流年四化</span><span class="ln-val">${lySihuaStr}</span></div>`+
    `<div class="ln-item ln-gloss"><span class="ln-label">四化斷語</span><span class="ln-val">${sihuaGloss}</span></div>`+
    `<div class="ln-item"><span class="ln-label">小限</span><span class="ln-val">${age}歲 → ${ln.xName}（${ln.xZhi}宮）</span></div>`;
  // 記錄高亮宮位（供渲染用）
  window.__hlLy=lyZhi;
  window.__hlX=ln.xZhi;
  // 流年四化標記：星->字（供盤上標注，金色）
  const lySihuaMark={};
  Object.entries(ln.lySihua).forEach(([k,star])=>lySihuaMark[star]=k);
  window.__lySihuaMark=lySihuaMark;
  // 十二神煞
  const SS=['歲建','晦氣','喪門','貫索','官符','小耗','大耗','龍德','白虎','天德','弔客','病符'];
  const ssStart=zIdx(lyZhi);
  document.getElementById('shenshaGrid').innerHTML=SS.map((s,i)=>{
    const z=ZHI[n12(ssStart+i)];
    const isLy = z===lyZhi;
    const desc=SS_DESC[s]||'';
    return `<div class="ss-item${isLy?' ss-ly':''}" title="${desc}"><span class="ss-name">${s}</span><span class="ss-zhi">${z}宮</span><span class="ss-desc">${desc}</span></div>`;
  }).join('');

  // 四化標記：找出四化星落宮（祿/權/科/忌 標在星旁）
  const sihuaMark={}; // 星->字
  Object.entries(sihua).forEach(([k,star])=>sihuaMark[star]=k);

  // 構建 12 宮（順序 = 逆時針，從命宮起）
  const mingIdx=zIdx(ms.mingZhi);
  const order=[]; // [{name, zhi, gz, stars:[], aux:[]}]
  for(let i=0;i<12;i++){
    const zhi=ZHI[n12(mingIdx-i)]; // 逆時針
    order.push({
      name:PALACE_NAMES[i],
      zhi,
      gz:gzMap[zhi],
      stars:stars[zhi]||[],
      aux:aux[zhi]||[],
      isMing: i===0,
      isShen: zhi===ms.shenZhi
    });
  }

  // 流年重點宮位提示（浩哥方案3）
  (function(){
    const lyPalace=order.find(o=>o.zhi===lyZhi);
    if(!lyPalace) return;
    const parts=[];
    lyPalace.stars.forEach(s=>{
      let t=s;
      if(window.__lySihuaMark && window.__lySihuaMark[s]) t+='（流'+window.__lySihuaMark[s]+'）';
      if(sihuaMark[s]) t+='（'+sihuaMark[s]+'）';
      parts.push(t);
    });
    lyPalace.aux.forEach(s=>{
      let t=s;
      if(window.__lySihuaMark && window.__lySihuaMark[s]) t+='（流'+window.__lySihuaMark[s]+'）';
      parts.push(t);
    });
    const starStr=parts.length?parts.join('、'):'（無主星）';
    // 宮位主題 + 主星特質斷語
    const theme=PALACE_THEME[lyPalace.name]||'';
    const mainStarTrait=lyPalace.stars.filter(s=>STAR_DESC[s]);
    const traitStr=mainStarTrait.length?
      mainStarTrait.map(s=>s+'：'+STAR_DESC[s]).join('；')
      :'空宮宜兼看對宮';
    const flowHua=lyPalace.stars.filter(s=>window.__lySihuaMark&&window.__lySihuaMark[s]);
    const flowStr=flowHua.length?'　流年四化影響：'+flowHua.map(s=>s+'化'+window.__lySihuaMark[s]).join('、')+'':'';
    const el=document.createElement('div');
    el.className='ln-item ln-focus';
    el.innerHTML=`<span class="ln-label">流年重點</span><span class="ln-val"><em>${lyPalace.name}（${lyPalace.zhi}宮）</em>·${theme}<br>${traitStr}${flowStr}</span>`;
    document.getElementById('liunianResult').appendChild(el);
  })();

  // 網格渲染（標準紫微盤方位）
  const gridMap={}; // idx -> [gridRow, gridCol]
  const P=[
    [3,0],[3,1],[3,2],[3,3],
    [2,3],[1,3],[0,3],[0,2],
    [0,1],[0,0],[1,0],[2,0]
  ];
  const chart=document.getElementById('chart');
  chart.innerHTML='';
  // 先建空 4x4
  const cells=Array(4).fill().map(()=>Array(4).fill(null));
  order.forEach((o,i)=>{ cells[P[i][0]][P[i][1]]={o,i}; });

  for(let r=0;r<4;r++){
    for(let c=0;c<4;c++){
      // 中間 2x2 放中心宮（grid item，天然不遮宮格）
      if(r>=1 && r<=2 && c>=1 && c<=2){
        if(r===1 && c===1){
          const cs=document.createElement('div');
          cs.className='center-square';
          cs.innerHTML=`<div class="center-gz">${mingGZ}</div><div class="center-name">${(wj.juName||'')}·命盤</div>`;
          chart.appendChild(cs);
        }
        continue;
      }
      const cell=cells[r][c];
      if(!cell){ continue; }
      const o=cell.o;
      const div=document.createElement('div');
      let cls='palace'+(o.isMing?' ming':'')+(o.isShen?' shen':'');
      if(window.__hlLy===o.zhi) cls+=' ly';
      if(window.__hlX===o.zhi) cls+=' xx';
      div.className=cls;
      // 標記命/身
      let name=o.name;
      if(o.isMing) name+='·命';
      if(o.isShen) name+='·身';
      if(window.__hlLy===o.zhi) name+='·流';
      if(window.__hlX===o.zhi) name+='·限';
      // 宮干加支
      const gzNow=o.gz;
      // 星（主星 + 四化標記）
      let starsHtml='';
      o.stars.forEach(s=>{
        let cls='star';
        if(ZIWEI_XI[s]!==undefined) cls+=' ziwei';
        if(TIANFU_XI[s]!==undefined) cls+=' tianfu';
        let label=s;
        if(sihuaMark[s]){ cls+=' sihua'; label+=''+sihuaMark[s]; }
        if(window.__lySihuaMark && window.__lySihuaMark[s]){ cls+=' ly-sihua'; label+='流'+window.__lySihuaMark[s]; }
        starsHtml+=`<span class="${cls}">${label}</span>`;
      });
      // 輔星（六吉六煞）
      o.aux.forEach(s=>{
        let cls='star aux';
        if(['擎羊','陀羅','火星','鈴星','地空','地劫'].includes(s)) cls+=' sha';
        let label=s;
        if(sihuaMark[s]){ cls+=' sihua'; label+=''+sihuaMark[s]; }
        if(window.__lySihuaMark && window.__lySihuaMark[s]){ cls+=' ly-sihua'; label+='流'+window.__lySihuaMark[s]; }
        starsHtml+=`<span class="${cls}">${label}</span>`;
      });
      div.innerHTML=`
        <div class="pal-top">
          <span class="pal-name">${name}</span>
          <span class="pal-gz">${gzNow}</span>
        </div>
        <div class="pal-stars">${starsHtml}</div>
      `;
      // 精確定位到 4x4 網格
      div.style.gridRow=(r+1)+' / '+(r+2);
      div.style.gridColumn=(c+1)+' / '+(c+2);
      chart.appendChild(div);
    }
  }

  // 資訊面板
  const info=document.getElementById('infoGrid');
  const infoData=[
    ['命宮', mingGZ+' 落'+ms.mingZhi+'宮'],
    ['身宮', gzMap[ms.shenZhi]+' 落'+ms.shenZhi+'宮'],
    ['五行局', (wj.naYin||'')+' · '+(wj.juName||'未定')],
    ['紫微', zz+'宮'],
    ['天府', tf+'宮'],
    ['四化('+yearGan+'干)', '祿'+sihua.祿+' 權'+sihua.權+' 科'+sihua.科+' 忌'+sihua.忌],
    ['命主', MINGZHU[yearZhi]||''],
    ['身主', SHENZHU[yearZhi]||'']
  ];
  info.innerHTML=infoData.map(d=>`<div class="info-item"><div class="k">${d[0]}</div><div class="v">${d[1]}</div></div>`).join('');

  // 三方四正（命宮 + 財帛 + 官祿 + 遷移）
  document.getElementById('sanfangPanel').style.display='';
  const sfIdx=[0,4,6,8]; // 命/財帛/遷移/官祿 (PALACE_NAMES 逆時針序)
  const sfLabels={0:'命宮',4:'財帛',6:'遷移',8:'官祿'};
  const sfHtml=sfIdx.map(i=>{
    const p=order[i];
    const sfStars=[...p.stars.map(s=>{let t=s;if(sihuaMark[s])t+='('+sihuaMark[s]+')';return t;}),...p.aux];
    const starStr=sfStars.length?sfStars.join('、'):'（空宮）';
    return `<div class="sf-item"><div class="sf-name">${sfLabels[i]}<span class="sf-zhi">${p.zhi}宮</span></div><div class="sf-gz">${p.gz}</div><div class="sf-stars">${starStr}</div></div>`;
  }).join('');
  document.getElementById('sanfangGrid').innerHTML=sfHtml;

  // 十二宮逐宮斷語
  document.getElementById('shierPanel').style.display='';
  const shierHtml=order.map((p,i)=>{
    const theme=PALACE_THEME[PALACE_NAMES[i]]||'';
    const zhu=p.stars.filter(s=>STAR_DESC[s]);
    const zhuStr=zhu.length?zhu.map(s=>s+(sihuaMark[s]?'('+sihuaMark[s]+')':'')+'·'+STAR_DESC[s]).join('；'):'（空宮）';
    const mark=(p.isMing?'·命':'')+(p.isShen?'·身':'');
    return `<div class="shier-item${p.isMing?' shier-ming':''}"><div class="shier-head"><span class="shier-name">${PALACE_NAMES[i]}${mark}</span><span class="shier-zhi">${p.zhi}宮</span></div><div class="shier-theme">${theme}</div><div class="shier-gz">${p.gz}</div><div class="shier-desc">${zhuStr}</div></div>`;
  }).join('');
  document.getElementById('shierGrid').innerHTML=shierHtml;

  // 財運 / 取名 / 吉祥號 分析
  renderFortune(order, sihuaMark, sihua, ms.mingZhi, ms.shenZhi, wj, aux);
  renderName(yearGan, yearZhi, ms.mingZhi, wj);
  renderLucky(yearGan, yearZhi);
  renderFengshui(order, aux);
  renderHealth(order, sihuaMark);
  renderFlower(yearZhi, aux, gzMap);
  renderLuopan(order, aux, ms.mingZhi);
  renderYuncheng(yearZhi);
  document.getElementById('hehunPanel').style.display='';
  document.getElementById('wugePanel').style.display='';
  document.getElementById('haoPanel').style.display='';
  document.getElementById('luopanPanel').style.display='';
  document.getElementById('yunchengPanel').style.display='';
  document.getElementById('comparePanel').style.display='';

  // 命宮主星斷語
  const mingPalace=order[0];
  const mingStars=mingPalace.stars.filter(s=>STAR_DESC[s]);
  const dyBlock=document.getElementById('duanyuBlock');
  const dyList=document.getElementById('duanyuList');
  if(mingStars.length){
    dyBlock.style.display='';
    dyList.innerHTML=mingStars.map(s=>{
      const hua=sihuaMark[s]?'（'+sihuaMark[s]+'）':'';
      return `<div class="dy-item"><span class="dy-star">${s}${hua}</span><span class="dy-text">${STAR_DESC[s]}</span></div>`;
    }).join('');
  } else {
    dyBlock.style.display='none';
    // 空宮提示
    if(!mingPalace.stars.length){
      const duiZhi=ZHI[n12(zIdx(mingPalace.zhi)+6)]; // 對宮=+6
      const duiPal=order.find(o=>o.zhi===duiZhi);
      const duiStars=duiPal?duiPal.stars.join('、'):'無';
      const duiName=duiPal?duiPal.name:'';
      const empty=document.getElementById('duanyuList');
      dyBlock.style.display='';
      empty.innerHTML=`<div class="dy-item"><span class="dy-star">空宮</span><span class="dy-text">${mingPalace.name}無主星，實務上借對宮〈${duiName}·${duiZhi}宮〉論斷：${duiStars}（文化參考）</span></div>`;
    }
  }

  // 保存命盤數據，供導出圖片用
  window.__chartData={order, ms, zz, tf, mingGZ, wj, yearGan, sihuaMark, lyZhi};
}

document.getElementById('calcBtn').addEventListener('click', render);
document.getElementById('solarBtn').addEventListener('click', applySolar);

// 排盤示例
const DEMO={
  boss:{sy:1968, sm:5, sd:28, sh:11, sg:'男'},
  son:{sy:1995, sm:10, sd:21, sh:9, sg:'男'},
  s4:{sy:2003, sm:12, sd:31, sh:5, sg:'女'},
  s7:{sy:2010, sm:4, sd:22, sh:2, sg:'男'},
  s6:{sy:1958, sm:11, sd:20, sh:10, sg:'男'}
};
document.getElementById('demoBtn').addEventListener('click', ()=>{
  const k=document.getElementById('demoSel').value;
  if(!k||!DEMO[k]){ alert('請選擇一個示例'); return; }
  const d=DEMO[k];
  document.getElementById('sy').value=d.sy;
  document.getElementById('sm').value=d.sm;
  document.getElementById('sd').value=d.sd;
  document.getElementById('sh').value=d.sh;
  document.getElementById('sg').value=d.sg;
  applySolar();
});
// 自動推流年：出生年干支 + 虛歲 → 流年干支
function autoLiunian(){
  const bGan=document.getElementById('yearGan').value;
  const bZhi=document.getElementById('yearZhi').value;
  const age=parseInt(document.getElementById('age').value,10)||1;
  const off=age-1;
  const g=GAN[n10(gIdx(bGan)+off)];
  const z=ZHI[n12(zIdx(bZhi)+off)];
  document.getElementById('lyGan').value=g;
  document.getElementById('lyZhi').value=z;
  render();
}
document.getElementById('autoLyBtn').addEventListener('click', autoLiunian);
// 初始排一張
window.addEventListener('DOMContentLoaded', () => {
  // 讀取 URL 分享參數，若有則填入
  const p=new URLSearchParams(location.search);
  if(p.get('sy') && p.get('sm') && p.get('sd')){
    document.getElementById('sy').value=p.get('sy');
    document.getElementById('sm').value=p.get('sm');
    document.getElementById('sd').value=p.get('sd');
    if(p.get('sh')) document.getElementById('sh').value=p.get('sh');
    if(p.get('sg')) document.getElementById('sg').value=decodeURIComponent(p.get('sg'));
  }
  applySolar();
});

// 導出命盤圖片（原生 Canvas 重繪，不依賴外部庫）
function exportChart(){
  const d=window.__chartData;
  if(!d||!d.order) return;
  const S=760, CELL=S/4; // 畫布尺寸
  const cv=document.createElement('canvas');
  cv.width=S; cv.height=S;
  const ctx=cv.getContext('2d');
  // 背景
  ctx.fillStyle='#1a1108'; ctx.fillRect(0,0,S,S);
  // 排版地圖（與 DOM 相同的方位）
  const P=[[3,0],[3,1],[3,2],[3,3],[2,3],[1,3],[0,3],[0,2],[0,1],[0,0],[1,0],[2,0]];
  const cellData=Array(4).fill().map(()=>Array(4).fill(null));
  d.order.forEach((o,i)=>{ cellData[P[i][0]][P[i][1]]=o; });
  const cx=2, cy=2, cw=CELL-4, ch=CELL-4;
  for(let r=0;r<4;r++){
    for(let c=0;c<4;c++){
      const o=cellData[r][c];
      if(!o) continue;
      const x=c*CELL, y=r*CELL;
      // 宮格背景
      ctx.fillStyle= o.zhi===d.lyZhi ? 'rgba(201,164,88,.16)' : 'rgba(255,250,238,.05)';
      ctx.strokeStyle='rgba(201,164,88,.5)';
      ctx.lineWidth= o.zhi===d.lyZhi?2:1;
      ctx.fillRect(x+1,y+1,CELL-2,CELL-2);
      ctx.strokeRect(x+1.5,y+1.5,CELL-3,CELL-3);
      // 宮名 + 干支
      ctx.fillStyle='#c9a458'; ctx.font='bold 22px "Noto Serif TC",serif';
      ctx.textBaseline='middle';
      let name=o.name;
      if(o.isMing) name+='·命'; if(o.isShen) name+='·身';
      ctx.fillText(name, x+14, y+24);
      ctx.fillStyle='#7a6a50'; ctx.font='17px "Noto Serif TC",serif';
      ctx.textAlign='right';
      ctx.fillText(o.gz, x+CELL-14, y+24);
      ctx.textAlign='left';
      // 星曜
      const stars=[...o.stars.map(s=>{let t=s; if(d.sihuaMark&&d.sihuaMark[s])t+=''+d.sihuaMark[s]; return t;}), ...o.aux];
      ctx.font='17px "Noto Serif TC",serif';
      let sy=y+56;
      stars.forEach(s=>{
        ctx.fillStyle='#7cb295'; ctx.fillText(s, x+14, sy); sy+=26;
      });
    }
  }
  // 中心天命
  ctx.fillStyle='#2c1b0c'; ctx.fillRect(S/2-110,S/2-110,220,220);
  ctx.strokeStyle='#c9a458'; ctx.lineWidth=2; ctx.strokeRect(S/2-110.5,S/2-110.5,221,221);
  ctx.fillStyle='#e6cf96'; ctx.font='bold 34px "Noto Serif TC",serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(d.mingGZ, S/2, S/2-8);
  ctx.fillStyle='#7a6a50'; ctx.font='20px "Noto Serif TC",serif';
  ctx.fillText('命盤', S/2, S/2+40);
  ctx.textAlign='left';
  // 下載
  cv.toBlob(b=>{
    const a=document.createElement('a');
    a.href=URL.createObjectURL(b);
    a.download='ziwei-chart-'+d.yearGan+d.zz+'.png';
    a.click();
    URL.revokeObjectURL(a.href);
  });
}
document.getElementById('exportBtn').addEventListener('click', exportChart);

// 導航：排盤後顯示 + 錨點平滑滾動 + 返回頂部
function showNav(){ document.getElementById('stickyNav').style.display='flex'; }
// 排盤後顯示導航
const _origRender=render;
render=function(){ _origRender(); showNav(); };
document.querySelectorAll('.nav-link').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const t=document.querySelector(a.getAttribute('href'));
    if(t) t.scrollIntoView({behavior:'smooth', block:'start'});
  });
});
document.getElementById('toTopBtn').addEventListener('click', ()=>window.scrollTo({top:0, behavior:'smooth'}));

// 複製排盤結果
function copyResult(){
  const d=window.__chartData;
  if(!d) return;
  const birth=window.__birth;
  const bazi=window.__bazi;
  let txt='【玄曜紫微斗數 · 排盤結果】\n';
  if(birth) txt+='出生：'+birth.sy+'年'+birth.sm+'月'+birth.sd+'日 · '+birth.sg+'命\n';
  if(bazi) txt+='八字：'+bazi.map(b=>b.gz).join(' ')+'\n';
  txt+='\n【命盤】\n';
  txt+='命宮：'+d.mingGZ+'（'+d.mingZhi+'宮）　身宮：'+d.shenZhi+'宮\n';
  txt+='五行局：'+d.wj.juName+'　紫微在'+d.zz+'宮　天府在'+d.tf+'宮\n';
  txt+='命主：'+(MINGZHU[d.yearZhi]||'')+'　身主：'+(SHENZHU[d.yearZhi]||'')+'\n';
  txt+='四化：祿'+d.sihua.祿+' 權'+d.sihua.權+' 科'+d.sihua.科+' 忌'+d.sihua.忌+'\n';
  txt+='\n【十二宮】\n';
  d.order.forEach((p,i)=>{
    const stars=[...p.stars.map(s=>s+(d.sihuaMark&&d.sihuaMark[s]?'('+d.sihuaMark[s]+')':'')),...p.aux];
    txt+=PALACE_NAMES[i]+'（'+p.zhi+'宮·'+p.gz+'）：'+(stars.length?stars.join('、'):'空宮')+'\n';
  });
  // 大限
  if(d.daxian){
    txt+='\n【大限】（'+(d.daxian.shun?'順行':'逆行')+'·'+d.daxian.start+'歲起）\n';
    d.daxian.res.forEach(l=>{ txt+=l.startAge+'歲 '+l.name+'·'+l.zhi+'（'+l.startAge+'-'+l.startAge+9+'歲）\n'; });
  }
  // 複製
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(()=>alert('已複製排盤結果！')).catch(()=>fallbackCopy(txt));
  } else {
    fallbackCopy(txt);
  }
}
function fallbackCopy(txt){
  const ta=document.createElement('textarea');
  ta.value=txt; document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); alert('已複製排盤結果！'); }catch(e){ alert('複製失敗，請手動複製'); }
  document.body.removeChild(ta);
}
document.getElementById('copyBtn').addEventListener('click', copyResult);

// 分享鏈接：複製帶參數的完整 URL
function shareLink(){
  const url=location.origin+location.pathname+location.search;
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(()=>alert('已複製分享鏈接！\n'+url)).catch(()=>fallbackCopy(url));
  } else fallbackCopy(url);
}
document.getElementById('shareBtn').addEventListener('click', shareLink);

// 導出完整命理報告（.txt）
function exportReport(){
  const d=window.__chartData;
  if(!d) return;
  const birth=window.__birth;
  const bazi=window.__bazi;
  const L=[];
  const hr='\n'+'─'.repeat(30)+'\n';
  L.push('【玄曜紫微斗數 · 完整命理報告】');
  L.push('生成時間：'+new Date().toLocaleString('zh-TW'));
  if(birth) L.push('出生：'+birth.sy+'年'+birth.sm+'月'+birth.sd+'日 · '+birth.sg+'命');
  if(bazi) L.push('八字四柱：'+bazi.map(b=>b.t+' '+b.gz).join('　'));
  L.push(hr);
  L.push('【命盤總覽】');
  L.push('命宮：'+d.mingGZ+'（'+d.mingZhi+'宮）　身宮：'+d.shenZhi+'宮');
  L.push('五行局：'+d.wj.juName+'　紫微在'+d.zz+'宮　天府在'+d.tf+'宮');
  L.push('命主：'+(MINGZHU[d.yearZhi]||'')+'　身主：'+(SHENZHU[d.yearZhi]||''));
  L.push('四化：祿'+d.sihua.祿+' 權'+d.sihua.權+' 科'+d.sihua.科+' 忌'+d.sihua.忌);
  L.push(hr);
  L.push('【三方四正】');
  [0,4,6,8].forEach(i=>{
    const p=d.order[i];
    const stars=[...p.stars.map(s=>s+(d.sihuaMark&&d.sihuaMark[s]?'('+d.sihuaMark[s]+')':'')),...p.aux];
    L.push(PALACE_NAMES[i]+'（'+p.zhi+'宮·'+p.gz+'）：'+(stars.length?stars.join('、'):'空宮'));
  });
  L.push(hr);
  L.push('【十二宮評析】');
  d.order.forEach((p,i)=>{
    const theme=PALACE_THEME[PALACE_NAMES[i]]||'';
    const zhu=p.stars.filter(s=>STAR_DESC[s]);
    const zhuStr=zhu.length?zhu.map(s=>s+'·'+STAR_DESC[s]).join('；'):'（空宮）';
    L.push(PALACE_NAMES[i]+'（'+p.zhi+'宮·'+p.gz+'）'+theme+'　'+zhuStr);
  });
  L.push(hr);
  L.push('【大限】'+(d.daxian?'（'+(d.daxian.shun?'順行':'逆行')+'·'+d.daxian.start+'歲起）':''));
  if(d.daxian) d.daxian.res.forEach(l=>L.push(l.startAge+'歲 '+l.name+'·'+l.zhi+'（'+l.startAge+'-'+l.startAge+9+'歲）'));
  L.push(hr);
  L.push('【流年 · 小限】');
  const lyGan=document.getElementById('lyGan').value, lyZhi=document.getElementById('lyZhi').value;
  const age=parseInt(document.getElementById('age').value,10)||1;
  const ln=calcLiunian(lyGan, lyZhi, d.mingZhi, document.getElementById('gender').value, age);
  L.push('流年太歲：'+lyGan+lyZhi+'年 · '+ln.lyName+'（'+lyZhi+'宮）');
  L.push('流年四化：祿'+ln.lySihua.祿+' 權'+ln.lySihua.權+' 科'+ln.lySihua.科+' 忌'+ln.lySihua.忌);
  L.push('小限：'+age+'歲 → '+ln.xName+'（'+ln.xZhi+'宮）');
  L.push('十二神煞：'+ln.shensha.map(s=>s.shen+'('+s.zhi+')').join('、'));
  L.push(hr);
  L.push('※ 本報告為文化娛樂參考，命理斷語僅供參考，不構成任何建議。');
  const txt=L.join('\n');
  const blob=new Blob([txt],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='ziwei-report-'+d.yearGan+d.zz+'.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}
document.getElementById('reportBtn').addEventListener('click', exportReport);

// 命盤記錄（localStorage）
const REC_KEY='ziwei_records';
function getRecords(){ try{ return JSON.parse(localStorage.getItem(REC_KEY)||'[]'); }catch(e){ return []; } }
function saveRecords(list){ localStorage.setItem(REC_KEY, JSON.stringify(list)); }
function renderRecords(){
  const list=getRecords();
  const panel=document.getElementById('recordsPanel');
  const box=document.getElementById('recordsList');
  if(list.length===0){ panel.style.display='none'; box.innerHTML=''; return; }
  panel.style.display='';
  box.innerHTML=list.map((r,i)=>`<div class="rec-item"><div class="rec-info"><span class="rec-name">${r.name}</span><span class="rec-meta">${r.birth} · ${r.gender}命</span><span class="rec-bazi">${r.bazi}</span></div><div class="rec-actions"><button class="rec-load" data-i="${i}">載入</button><button class="rec-del" data-i="${i}">刪</button></div></div>`).join('');
  box.querySelectorAll('.rec-load').forEach(b=>b.addEventListener('click',()=>loadRecord(parseInt(b.dataset.i))));
  box.querySelectorAll('.rec-del').forEach(b=>b.addEventListener('click',()=>delRecord(parseInt(b.dataset.i))));
}
document.getElementById('saveBtn').addEventListener('click', ()=>{
  const birth=window.__birth;
  const bazi=window.__bazi;
  if(!birth){ alert('請先排盤'); return; }
  const name=prompt('為這個命盤取名：（留空用出生日期）', birth.sy+'-'+birth.sm+'-'+birth.sd);
  let list=getRecords();
  list.push({name:name||birth.sy+'-'+birth.sm+'-'+birth.sd, birth:birth.sy+'年'+birth.sm+'月'+birth.sd+'日', gender:birth.sg, bazi:(bazi?bazi.map(b=>b.gz).join(' '):''), sy:birth.sy, sm:birth.sm, sd:birth.sd, sh:window.__birth.sh, sg:birth.sg});
  saveRecords(list);
  renderRecords();
  alert('已保存命盤！');
});
function loadRecord(i){
  const list=getRecords();
  const r=list[i]; if(!r) return;
  document.getElementById('sy').value=r.sy;
  document.getElementById('sm').value=r.sm;
  document.getElementById('sd').value=r.sd;
  document.getElementById('sh').value=r.sh;
  document.getElementById('sg').value=r.sg;
  window.scrollTo({top:0, behavior:'smooth'});
  applySolar();
}
function delRecord(i){
  let list=getRecords(); list.splice(i,1); saveRecords(list); renderRecords();
}
renderRecords();

// ===== 財運 / 取名 / 吉祥號 分析 =====
function renderFortune(order, sihuaMark, sihua, mingZhi, shenZhi, wj, aux){
  const panel=document.getElementById('fortPanel');
  const box=document.getElementById('fortContent');
  panel.style.display='';
  const H=[];
  // 財帛宮（order[4]）
  const cp=order[4];
  const cpStars=cp.stars;
  const cpAux=cp.aux;
  // 財帛宮主星財富特質
  const fortStars=cpStars.filter(s=>FORTUNE_STAR[s]);
  H.push('<div class="ft-item"><div class="ft-head">財帛宮（'+cp.zhi+'宮·'+cp.gz+'）</div><div class="ft-body">');
  if(fortStars.length){
    fortStars.forEach(s=>{ H.push('<div class="ft-line"><span class="ft-key">'+s+(sihuaMark&&sihuaMark[s]?'('+sihuaMark[s]+')':'')+'</span>'+FORTUNE_STAR[s]+'</div>'); });
  } else {
    // 空宮借對宮（財帛對宮=福德）
    const dui=order[10];
    const duiFort=dui.stars.filter(s=>FORTUNE_STAR[s]);
    if(duiFort.length) duiFort.forEach(s=>H.push('<div class="ft-line"><span class="ft-key">'+s+'（借對宮）</span>'+FORTUNE_STAR[s]+'</div>'));
    else H.push('<div class="ft-line">財帛宮空宮，財運較需自主經營</div>');
  }
  // 財帛宮輔星財訊
  if(cpAux.includes('祿存')) H.push('<div class="ft-line"><span class="ft-key">祿存</span>主財祿有儲，宜穩健守財</div>');
  if(cpAux.includes('擎羊')||cpAux.includes('陀羅')) H.push('<div class="ft-line"><span class="ft-key">擎羊/陀羅</span>財帛波動較大，宜防破耗</div>');
  // 化祿/化權
  if(sihuaMark) H.push('<div class="ft-line">四化財訊：'+Object.entries(sihua).filter(([k])=>k==='祿'||k==='權').map(([k,star])=>(k==='祿'?star+'化祿主財旺':'')).filter(Boolean).join('、')+'</div>');
  H.push('</div></div>');
  // 大限財帛（找大限在財帛宮的年份）
  const dx=window.__chartData?window.__chartData.daxian:null;
  if(dx){
    H.push('<div class="ft-item"><div class="ft-head">大限財運</div><div class="ft-body">');
    const moneyLimit=dx.res[4]; // 財帛宮大限
    if(moneyLimit) H.push('<div class="ft-line"><span class="ft-key">'+moneyLimit.startAge+'歲起</span>財帛宮大限（'+moneyLimit.startAge+'-'+moneyLimit.startAge+9+'歲）</div>');
    H.push('</div></div>');
  }
  box.innerHTML=H.join('');
}

function renderName(yearGan, yearZhi, mingZhi, wj){
  const panel=document.getElementById('namePanel');
  const box=document.getElementById('nameContent');
  panel.style.display='';
  const H=[];
  H.push('<div class="ft-item"><div class="ft-head">命主 · 身主（本命守護）</div><div class="ft-body">');
  H.push('<div class="ft-line"><span class="ft-key">命主</span>'+(MINGZHU[yearZhi]||'')+'　主一生氣質方向</div>');
  H.push('<div class="ft-line"><span class="ft-key">身主</span>'+(SHENZHU[yearZhi]||'')+'　主後天發展重點</div>');
  H.push('</div></div>');
  H.push('<div class="ft-item"><div class="ft-head">五行局（取名補缺）</div><div class="ft-body">');
  H.push('<div class="ft-line"><span class="ft-key">五行局</span>'+wj.juName+'（'+wj.naYin+'）</div>');
  H.push('</div></div>');
  // 八字五行喜用（粗算：日干五行 + 各柱五行）
  const bazi=window.__bazi;
  if(bazi){
    H.push('<div class="ft-item"><div class="ft-head">八字五行</div><div class="ft-body">');
    const gzList=bazi.map(b=>b.gz);
    const five={木:0,火:0,土:0,金:0,水:0};
    gzList.forEach(gz=>{
      five[GAN_WUXING[gz[0]]]=(five[GAN_WUXING[gz[0]]]||0)+1;
      five[ZHI_WUXING[gz[1]]]=(five[ZHI_WUXING[gz[1]]]||0)+1;
    });
    H.push('<div class="ft-line">'+Object.entries(five).map(([k,v])=>k+(v?'×'+v:'×0')).join('　')+'</div>');
    // 最缺的五行
    const minFive=Object.entries(five).sort((a,b)=>a[1]-b[1])[0];
    H.push('<div class="ft-line"><span class="ft-key">建議補</span>'+(minFive[0])+'（八字較缺，取名可補）</div>');
    H.push('</div></div>');
  }
  box.innerHTML=H.join('');
}

function renderLucky(yearGan, yearZhi){
  const panel=document.getElementById('luckyPanel');
  const box=document.getElementById('luckyContent');
  panel.style.display='';
  const H=[];
  // 命主五行 + 年干五行
  const mingZhu=MINGZHU[yearZhi]||'';
  const ganWu=GAN_WUXING[yearGan];
  H.push('<div class="ft-item"><div class="ft-head">幸運五行</div><div class="ft-body">');
  H.push('<div class="ft-line"><span class="ft-key">年干五行</span>'+yearGan+'屬'+ganWu+'</div>');
  H.push('</div></div>');
  // 數字五行
  H.push('<div class="ft-item"><div class="ft-head">數字五行配數</div><div class="ft-body">');
  H.push('<div class="ft-line">1/6屬水　2/7屬火　3/8屬木　4/9屬金　5/0屬土</div>');
  H.push('</div></div>');
  // 建議幸運數字
  H.push('<div class="ft-item"><div class="ft-head">吉祥數字建議</div><div class="ft-body">');
  H.push('<div class="ft-line"><span class="ft-key">補'+ganWu+'</span>'+(ganWu==='水'?'1、6':ganWu==='火'?'2、7':ganWu==='木'?'3、8':ganWu==='金'?'4、9':'5、0')+'</div>');
  H.push('</div></div>');
  box.innerHTML=H.join('');
}

// 風水方位
const ZHI_FANGWEI={子:'正北',丑:'東北',寅:'東北',卯:'正東',辰:'東南',巳:'東南',午:'正南',未:'西南',申:'西南',酉:'正西',戌:'西北',亥:'西北'};
// 八宅本命卦
function calcMingGua(year, gender){
  const GUA={1:'坎',2:'坤',3:'震',4:'巽',5:'中',6:'乾',7:'兑',8:'艮',9:'离'};
  const y2=year%100;
  let r = year<=1999 ? (gender==='男'?(100-y2)%9:(y2-4)%9) : (gender==='男'?(99-y2)%9:((y2-4)+9)%9);
  if(r===0) r=9;
  if(r===5) return gender==='男'?'坤':'艮';
  return GUA[r];
}
function renderFengshui(order, aux){
  const panel=document.getElementById('fengshuiPanel');
  const box=document.getElementById('fengshuiContent');
  panel.style.display='';
  const H=[];
  // 本命卦（八宅派）
  const birth=window.__birth;
  if(birth){
    const mg=calcMingGua(birth.sy, birth.sg);
    const GUA_WX={坎:'水',坤:'土',震:'木',巽:'木',乾:'金',兑:'金',艮:'土',离:'火'};
    H.push('<div class="ft-item"><div class="ft-head">本命卦（八宅風水）</div><div class="ft-body">');
    H.push('<div class="ft-line"><span class="ft-key">本命卦</span>'+mg+'卦（屬'+GUA_WX[mg]+'）</div>');
    // 东四命/西四命
    const east=['坎','震','巽','离'], west=['乾','坤','艮','兑'];
    const grp = east.includes(mg)?'東四命':'西四命';
    H.push('<div class="ft-line"><span class="ft-key">命屬</span>'+grp+'，宜住'+grp+'宅</div>');
    H.push('</div></div>');
  }
  H.push('<div class="ft-item"><div class="ft-head">文昌位（書房·學業）</div><div class="ft-body">');
  // 文昌星落宮
  let wenchangZhi=null;
  for(const z of ZHI){ if((aux[z]||[]).includes('文昌')){ wenchangZhi=z; break; } }
  if(wenchangZhi) H.push('<div class="ft-line"><span class="ft-key">文昌在'+wenchangZhi+'宮</span>書房/書桌宜朝'+ZHI_FANGWEI[wenchangZhi]+'</div>');
  else H.push('<div class="ft-line">文昌星位需配合年干安星</div>');
  H.push('</div></div>');
  // 財帛宮財位
  const cp=order[4];
  H.push('<div class="ft-item"><div class="ft-head">財位（財帛宮方位）</div><div class="ft-body">');
  H.push('<div class="ft-line"><span class="ft-key">財帛宮在'+cp.zhi+'宮</span>宜於'+ZHI_FANGWEI[cp.zhi]+'佈財位/收銀/保險櫃</div>');
  H.push('</div></div>');
  // 田宅宮住宅方位
  const tp=order[9];
  H.push('<div class="ft-item"><div class="ft-head">住宅方位（田宅宮）</div><div class="ft-body">');
  H.push('<div class="ft-line"><span class="ft-key">田宅宮在'+tp.zhi+'宮</span>宅命根基方位在'+ZHI_FANGWEI[tp.zhi]+'，宜重該方位採光通風</div>');
  H.push('</div></div>');
  // 命宮宜忌方位
  const mp=order[0];
  H.push('<div class="ft-item"><div class="ft-head">命宮方位</div><div class="ft-body">');
  H.push('<div class="ft-line"><span class="ft-key">命宮在'+mp.zhi+'宮</span>主臥/辦公桌宜朝向'+ZHI_FANGWEI[mp.zhi]+'</div>');
  H.push('</div></div>');
  box.innerHTML=H.join('');
}

// 健康分析（疾厄宮）
function renderHealth(order, sihuaMark){
  const panel=document.getElementById('healthPanel');
  const box=document.getElementById('healthContent');
  panel.style.display='';
  const H=[];
  const hp=order[5]; // 疾厄宮
  H.push('<div class="ft-item"><div class="ft-head">疾厄宮（'+hp.zhi+'宮·'+hp.gz+'）</div><div class="ft-body">');
  const healthStars=hp.stars.filter(s=>HEALTH_STAR[s]);
  if(healthStars.length){
    healthStars.forEach(s=>H.push('<div class="ft-line"><span class="ft-key">'+s+(sihuaMark&&sihuaMark[s]?'('+sihuaMark[s]+')':'')+'</span>'+HEALTH_STAR[s]+'</div>'));
  } else {
    const dui=order[11];
    const duiH=dui.stars.filter(s=>HEALTH_STAR[s]);
    if(duiH.length) duiH.forEach(s=>H.push('<div class="ft-line"><span class="ft-key">'+s+'（借對宮）</span>'+HEALTH_STAR[s]+'</div>'));
    else H.push('<div class="ft-line">疾厄宮空宮，體質較需自主調養</div>');
  }
  const sha=hp.aux.filter(s=>['擎羊','陀羅','火星','鈴星','地空','地劫'].includes(s));
  if(sha.length) H.push('<div class="ft-line"><span class="ft-key">煞星</span>'+sha.join('、')+'，宜注意突發與勞損</div>');
  H.push('</div></div>');
  H.push('<div class="ft-item"><div class="ft-head">健康方位</div><div class="ft-body">');
  H.push('<div class="ft-line"><span class="ft-key">疾厄宮在'+hp.zhi+'宮</span>養生宜重'+ZHI_FANGWEI[hp.zhi]+'方位之環境</div>');
  H.push('</div></div>');
  box.innerHTML=H.join('');
}

// 桃花·貴人·學業
const HONGLUAN={子:'辰',丑:'卯',寅:'寅',卯:'丑',辰:'子',巳:'亥',午:'戌',未:'酉',申:'申',酉:'未',戌:'午',亥:'巳'};
function renderFlower(yearZhi, aux, gzMap){
  const panel=document.getElementById('flowerPanel');
  const box=document.getElementById('flowerContent');
  panel.style.display='';
  const H=[];
  // 桃花（紅鸞/天喜同宮）
  const hl=HONGLUAN[yearZhi];
  const tx=ZHI[n12(zIdx(hl)+6)];
  const gw=(gzMap&&gzMap[hl])||'';
  H.push('<div class="ft-item"><div class="ft-head">桃花位（紅鸞·天喜）</div><div class="ft-body">');
  H.push('<div class="ft-line"><span class="ft-key">紅鸞在'+hl+'宮（'+gw+'）</span>主正緣、婚淑，命主桃花緣分所在</div>');
  H.push('<div class="ft-line"><span class="ft-key">天喜在'+tx+'宮</span>主喜慶、姻緣，婚姻吉位</div>');
  H.push('</div></div>');
  // 貴人（天魁/天鉞）
  let kui=null, yue=null;
  for(const z of ZHI){ if((aux[z]||[]).includes('天魁')) kui=z; if((aux[z]||[]).includes('天鉞')) yue=z; }
  H.push('<div class="ft-item"><div class="ft-head">貴人位（天魁·天鉞）</div><div class="ft-body">');
  H.push('<div class="ft-line"><span class="ft-key">天魁'+(kui?'在'+kui+'宮':'')+'</span>陽貴，主男性/白天貴人助力</div>');
  H.push('<div class="ft-line"><span class="ft-key">天鉞'+(yue?'在'+yue+'宮':'')+'</span>陰貴，主女性/暗夜貴人助力</div>');
  H.push('</div></div>');
  // 學業（文昌/文曲）
  let wc=null, wq=null;
  for(const z of ZHI){ if((aux[z]||[]).includes('文昌')) wc=z; if((aux[z]||[]).includes('文曲')) wq=z; }
  H.push('<div class="ft-item"><div class="ft-head">學業位（文昌·文曲）</div><div class="ft-body">');
  H.push('<div class="ft-line"><span class="ft-key">文昌'+(wc?'在'+wc+'宮':'')+'</span>正途學業、文書、考試之利</div>');
  H.push('<div class="ft-line"><span class="ft-key">文曲'+(wq?'在'+wq+'宮':'')+'</span>才藝、口才、藝術之緣</div>');
  H.push('</div></div>');
  box.innerHTML=H.join('');
}

// 合婚分析
function renderHehun(){
  const panel=document.getElementById('hehunPanel');
  const box=document.getElementById('hehunResult');
  const birth=window.__birth;
  if(!birth){ box.innerHTML='<div class="ft-item"><div class="ft-body">請先排好甲方命盤</div></div>'; return; }
  const hy=parseInt(document.getElementById('hy').value,10);
  const hm=parseInt(document.getElementById('hm').value,10);
  const hd=parseInt(document.getElementById('hd').value,10);
  const hh=parseInt(document.getElementById('hh').value,10);
  const hg=document.getElementById('hg').value;
  if(!hy||!hm||!hd){ box.innerHTML='<div class="ft-item"><div class="ft-body">請填乙方完整生日</div></div>'; return; }
  // 乙方八字
  const bBazi=solarToAll(hy,hm,hd,hh);
  if(!bBazi){ box.innerHTML='<div class="ft-item"><div class="ft-body">乙方排盤失敗</div></div>'; return; }
  // 甲方：當前盤年干 + 夫妻宮
  const aGan=document.getElementById('yearGan').value;
  const bGan=bBazi.yearGan;
  // 五行相生相剋
  const SHENG={木:'火',火:'土',土:'金',金:'水',水:'木'};
  const KE={木:'土',土:'水',水:'火',火:'金',金:'木'};
  const aW=GAN_WUXING[aGan], bW=GAN_WUXING[bGan];
  let wu;
  if(aW===bW) wu='同五行，互相扶持但也有競爭';
  else if(SHENG[aW]===bW) wu='甲五行（'+aW+'）生乙（'+bW+'），甲旺而助乙，相合';
  else if(SHENG[bW]===aW) wu='乙五行（'+bW+'）生甲（'+aW+'），乙旺而助甲，相合';
  else if(KE[aW]===bW) wu='甲（'+aW+'）剋乙（'+bW+'），甲較強勢，需磨合';
  else if(KE[bW]===aW) wu='乙（'+bW+'）剋甲（'+aW+'），乙較強勢，需磨合';
  // 本命卦相配
  const aGua=calcMingGua(birth.sy, birth.sg);
  const bGua=calcMingGua(hy, hg);
  const east=['坎','震','巽','离'], west=['乾','坤','艮','兑'];
  const aEast=east.includes(aGua), bEast=east.includes(bGua);
  const guaOk = (aEast===bEast) ? '同屬'+(aEast?'東四命':'西四命')+'，住宅風向相合' : '一東四一西四命，宅向需各自考量';
  const H=[];
  H.push('<div class="ft-item"><div class="ft-head">五行相配</div><div class="ft-body">');
  H.push('<div class="ft-line"><span class="ft-key">甲</span>年干'+aGan+'屬'+aW+'</div>');
  H.push('<div class="ft-line"><span class="ft-key">乙</span>年干'+bGan+'屬'+bW+'</div>');
  H.push('<div class="ft-line">'+wu+'</div>');
  H.push('</div></div>');
  H.push('<div class="ft-item"><div class="ft-head">本命卦相配</div><div class="ft-body">');
  H.push('<div class="ft-line"><span class="ft-key">甲</span>'+aGua+'卦　<span class="ft-key">乙</span>'+bGua+'卦</div>');
  H.push('<div class="ft-line">'+guaOk+'</div>');
  H.push('</div></div>');
  H.push('<div class="ft-item"><div class="ft-head">八字四柱</div><div class="ft-body">');
  H.push('<div class="ft-line"><span class="ft-key">乙八字</span>'+(bBazi.bazi?bBazi.bazi.map(b=>b.gz).join(' '):'')+'</div>');
  H.push('</div></div>');
  box.innerHTML=H.join('');
}
document.getElementById('hehunBtn').addEventListener('click', renderHehun);

// 起名五格
// 81數理吉凶（簡表）
const JIXIONG=['大吉','吉','半吉','凶','大凶','吉帶凶'];
function numJixiong(n){
  // 簡化：依尾數定吉凶（1/3/5/6/7/8/11/13/15/16...吉）
  const ji=[1,3,5,6,7,8,11,13,15,16,17,18,21,23,24,25,29,31,32,33,35,37,39,41,45,47,48,52,57,61,63,65,67,68,81];
  const xiong=[2,4,9,10,12,14,19,20,22,26,27,28,30,34,36,38,40,42,43,44,46,49,50,51,53,54,56,58,60,62,64,66,69,70,72,73,74,75,76,77,78,79,80];
  if(ji.includes(n)) return '吉';
  if(xiong.includes(n)) return '凶';
  return '半吉';
}
function renderWuge(){
  const panel=document.getElementById('wugePanel');
  const box=document.getElementById('wugeResult');
  panel.style.display='';
  const s=parseInt(document.getElementById('wgSurname').value,10)||0;
  const m1=parseInt(document.getElementById('wgM1').value,10)||0;
  const m2=parseInt(document.getElementById('wgM2').value,10)||0;
  if(!s||!m1){ box.innerHTML='<div class="ft-item"><div class="ft-body">請填姓與名首字筆畫</div></div>'; return; }
  const tian=s+1;                       // 天格
  const ren=s+m1;                       // 人格
  const di=m1+(m2||1);                  // 地格（單名=+1）
  const zong=s+m1+m2;                   // 總格
  const wai=zong-ren+1;                 // 外格
  const H=[];
  const mk=(name,val,desc)=>`<div class="ft-line"><span class="ft-key">${name}</span>${val}（${numJixiong(val)}）　${desc}</div>`;
  H.push('<div class="ft-item"><div class="ft-head">五格數理</div><div class="ft-body">');
  H.push(mk('天格',tian,'祖上遺產、長輩助力'));
  H.push(mk('人格',ren,'主運，一生核心運勢'));
  H.push(mk('地格',di,'前運，早年與家庭'));
  H.push(mk('總格',zong,'總運，中晚年'));
  H.push(mk('外格',wai,'副運，人際貴人'));
  H.push('</div></div>');
  // 補五行建議（結合命盤）
  H.push('<div class="ft-item"><div class="ft-head">取名補五行</div><div class="ft-body">');
  H.push('<div class="ft-line">參考上方「取名建議」之八字五行，缺何補何</div>');
  H.push('</div></div>');
  box.innerHTML=H.join('');
}
document.getElementById('wugeBtn').addEventListener('click', renderWuge);

// 吉祥號評分
function renderHao(){
  const panel=document.getElementById('haoPanel');
  const box=document.getElementById('haoResult');
  panel.style.display='';
  const num=document.getElementById('haoNum').value.replace(/\D/g,'');
  if(!num){ box.innerHTML='<div class="ft-item"><div class="ft-body">請輸入號碼</div></div>'; return; }
  // 喜用五行（年干五行）
  const yearGan=document.getElementById('yearGan').value;
  const xiW=GAN_WUXING[yearGan]||'土';
  // 每位数字五行
  let score=60;
  const H=[];
  H.push('<div class="ft-item"><div class="ft-head">號碼 '+num+'</div><div class="ft-body">');
  // 数字五行分布
  const digits=num.split('');
  const wCount={木:0,火:0,土:0,金:0,水:0};
  digits.forEach(d=>{ const w=NUM_WUXING[parseInt(d)]; wCount[w]=(wCount[w]||0)+1; });
  H.push('<div class="ft-line">數字五行：'+Object.entries(wCount).map(([k,v])=>k+v).join('　')+'</div>');
  // 尾数
  const lastW=NUM_WUXING[parseInt(digits[digits.length-1])];
  H.push('<div class="ft-line"><span class="ft-key">尾數五行</span>'+lastW+'</div>');
  // 喜用判断
  if(lastW===xiW){ score+=20; H.push('<div class="ft-line"><span class="ft-key">尾數</span>屬'+lastW+'，與年干'+xiW+'相合，吉！</div>'); }
  else if(({木:'火',火:'土',土:'金',金:'水',水:'木'})[xiW]===lastW){ score+=12; H.push('<div class="ft-line"><span class="ft-key">尾數</span>屬'+lastW+'，生年干'+xiW+'，相生，吉！</div>'); }
  else { score-=8; H.push('<div class="ft-line"><span class="ft-key">尾數</span>屬'+lastW+'，與年干'+xiW+'不相生，可斟酌</div>'); }
  // 数理：数字和
  let sum=digits.reduce((a,b)=>a+parseInt(b),0);
  const sheng=(sum%9===0?9:sum%9);
  H.push('<div class="ft-line"><span class="ft-key">數理</span>數字和'+sum+'（'+(sheng>=5?'數偏吉':'數偏中')+'）</div>');
  H.push('</div></div>');
  // 综合评分
  const finalScore=Math.min(99,score);
  const grade=finalScore>=85?'上吉':finalScore>=70?'中吉':finalScore>=60?'中平':'偏凶';
  H.push('<div class="ft-item"><div class="ft-head">綜合評分</div><div class="ft-body">');
  H.push('<div class="ft-line"><span class="ft-key">評分</span><span style="font-size:26px;color:var(--gold-l);font-weight:700">'+finalScore+'分</span>（'+grade+'）</div>');
  H.push('</div></div>');
  box.innerHTML=H.join('');
}
document.getElementById('haoBtn').addEventListener('click', renderHao);

// 風水羅盤（Canvas）
const GUA_FANGWEI=['坎北','艮東北','震東','巽東南','離南','坤西南','兌西','乾西北'];
function renderLuopan(order, aux, mingZhi){
  const panel=document.getElementById('luopanPanel');
  const cv=document.getElementById('luopanCanvas');
  panel.style.display='';
  const ctx=cv.getContext('2d');
  const cx=180, cy=180, R=170;
  ctx.clearRect(0,0,360,360);
  // 背景
  const isLight=document.body.classList.contains('light');
  ctx.fillStyle=isLight?'#f3ead6':'#1a1108';
  ctx.fillRect(0,0,360,360);
  // 八卦方位（东=右，顺时针）
  const gua=[['坎','北'],['艮','東北'],['震','東'],['巽','東南'],['離','南'],['坤','西南'],['兌','西'],['乾','西北']];
  for(let i=0;i<8;i++){
    const ang=(i*45-90)*Math.PI/180; // 北在0度
    const x0=cx+Math.cos(ang)*R*0.5, y0=cy+Math.sin(ang)*R*0.5;
    // 扇形
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,R*0.85,ang-Math.PI/8,ang+Math.PI/8);
    ctx.closePath();
    ctx.fillStyle=(i%2)?(isLight?'#efe4cc':'#241708'):(isLight?'#e6dbc4':'#1d1206');
    ctx.fill();
    ctx.strokeStyle=isLight?'#a08040':'#c9a458';
    ctx.stroke();
    // 卦名文字
    const tx=cx+Math.cos(ang)*R*0.62, ty=cy+Math.sin(ang)*R*0.62;
    ctx.fillStyle=isLight?'#7a5a20':'#e6cf96';
    ctx.font='bold 16px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(gua[i][0], tx, ty-6);
    ctx.font='12px serif';
    ctx.fillText(gua[i][1], tx, ty+12);
  }
  // 中心
  ctx.beginPath(); ctx.arc(cx,cy,R*0.25,0,Math.PI*2);
  ctx.fillStyle=isLight?'#c9a458':'#2c1b0c';
  ctx.fill(); ctx.strokeStyle=isLight?'#7a5a20':'#c9a458'; ctx.stroke();
  ctx.fillStyle=isLight?'#3a2a18':'#e6cf96'; ctx.font='bold 14px serif';
  ctx.fillText('玄', cx, cy-4); ctx.fillText('曜', cx, cy+12);
  // 標註關鍵方位（用彩點）
  const marks=[];
  const mp=order[0]; // 命宮
  const cp=order[4]; // 財帛
  const wenchangZhi=null;
  for(const z of ZHI){ if((aux[z]||[]).includes('文昌')){ marks.push({name:'文昌',zhi:z,color:'#5a7d6a'}); break; } }
  marks.push({name:'命宮',zhi:mp.zhi,color:'#c9a458'});
  marks.push({name:'財位',zhi:cp.zhi,color:'#b23a2b'});
  // 地支→八卦角度
  const zhiAng={子:0,丑:45,寅:45,卯:90,辰:135,巳:135,午:180,未:225,申:225,酉:270,戌:315,亥:315};
  marks.forEach(m=>{
    const ang=(zhiAng[m.zhi]-90)*Math.PI/180;
    const x=cx+Math.cos(ang)*R*0.5, y=cy+Math.sin(ang)*R*0.5;
    ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2);
    ctx.fillStyle=m.color; ctx.fill();
    ctx.strokeStyle=isLight?'#3a2a18':'#fff'; ctx.lineWidth=1; ctx.stroke();
  });
  // 圖例
  const lg=document.getElementById('luopanLegend');
  lg.innerHTML=marks.map(m=>`<span class="lg"><i style="background:${m.color}"></i>${m.name}${m.zhi}宮</span>`).join('');
}

// 生肖運程
const SHENGXIAO=['鼠','牛','虎','兔','龍','蛇','馬','羊','猴','雞','狗','豬'];
function renderYuncheng(yearZhi){
  const panel=document.getElementById('yunchengPanel');
  const box=document.getElementById('yunchengContent');
  panel.style.display='';
  // 流年支（用流年選擇）
  const lyZhi=document.getElementById('lyZhi')?document.getElementById('lyZhi').value:'午';
  const H=[];
  H.push('<div class="ft-item"><div class="ft-head">流年 '+lyZhi+' 年 · 十二生肖運勢</div><div class="ft-body">');
  // 生肖与流年地支关系
  const liu={子:'鼠',丑:'牛',寅:'虎',卯:'兔',辰:'龍',巳:'蛇',午:'馬',未:'羊',申:'猴',酉:'雞',戌:'狗',亥:'豬'};
  for(const z of ZHI){
    const sx=liu[z];
    // 关系判断
    let rel='平', relDesc='運勢平穩，宜順其自然';
    if(z===lyZhi){ rel='值太歲'; relDesc='本命年值太歲，運勢多變，宜沉穩行事、防口舌是非'; }
    else if(({子:'午',丑:'未',寅:'申',卯:'酉',辰:'戌',巳:'亥',午:'子',未:'丑',申:'寅',酉:'卯',戌:'辰',亥:'巳'})[z]===lyZhi){ rel='沖太歲'; relDesc='沖太歲，運勢動盪，宜防變動、謹慎理財'; }
    else if(({子:'辰',丑:'巳',寅:'午',卯:'未',辰:'子',巳:'丑',午:'寅',未:'卯',申:'戌',酉:'亥',戌:'申',亥:'酉'})[z]===lyZhi){ rel='破太歲'; relDesc='破太歲，宜防破財、是非，守成為上'; }
    else if(({子:'申',丑:'酉',寅:'戌',卯:'亥',辰:'子',巳:'丑',午:'寅',未:'卯',申:'辰',酉:'巳',戌:'午',亥:'未'})[z]===lyZhi){ rel='合太歲'; relDesc='合太歲，運勢和順，利人際合作'; }
    const mark=(z===yearZhi)?'（本命）':'';
    H.push('<div class="ft-line"><span class="ft-key">'+sx+'年'+mark+'</span>'+rel+'：'+relDesc+'</div>');
  }
  H.push('</div></div>');
  box.innerHTML=H.join('');
}

// 斷語庫渲染
function initLibrary(){
  const libPanel=document.getElementById('libraryPanel');
  if(!libPanel) return;
  libPanel.style.display='';
  // 星曜
  document.getElementById('libStars').innerHTML=Object.entries(STAR_DESC).map(([s,d])=>`<div class="lib-item"><span class="lib-k">${s}</span><span class="lib-v">${d}</span></div>`).join('');
  // 宮位
  document.getElementById('libPalaces').innerHTML=Object.entries(PALACE_THEME).map(([s,d])=>`<div class="lib-item"><span class="lib-k">${s}</span><span class="lib-v">${d}</span></div>`).join('');
  // 四化
  document.getElementById('libSihua').innerHTML=Object.entries(SI_HUA_DESC).map(([s,d])=>`<div class="lib-item"><span class="lib-k">${s}</span><span class="lib-v">${d}</span></div>`).join('');
  // 神煞
  document.getElementById('libShensha').innerHTML=Object.entries(SS_DESC).map(([s,d])=>`<div class="lib-item"><span class="lib-k">${s}</span><span class="lib-v">${d}</span></div>`).join('');
  document.getElementById('libCombo').innerHTML=Object.entries(COMBO_DESC).map(([s,d])=>`<div class="lib-item"><span class="lib-k">${s}</span><span class="lib-v">${d}</span></div>`).join('');
  document.getElementById('libHuji').innerHTML=Object.entries(STAR_HUJI_DESC).map(([s,d])=>`<div class="lib-item"><span class="lib-k">${s}化忌</span><span class="lib-v">${d}</span></div>`).join('');
}
initLibrary();

// 主題切換
function applyTheme(t){
  document.body.classList.toggle('light', t==='light');
  localStorage.setItem('ziwei_theme', t);
}
document.getElementById('themeBtn').addEventListener('click', ()=>{
  const isLight=document.body.classList.contains('light');
  applyTheme(isLight?'dark':'light');
});
// 載入已存主題
const saved=localStorage.getItem('ziwei_theme');
if(saved==='light') applyTheme('light');

// 移動端摺疊面板：將每個 panel 標題後內容包進 .panel-body，點標題切換
function initCollapse(){
  if(window.innerWidth>640) return;
  document.querySelectorAll('section.panel').forEach(panel=>{
    if(panel.querySelector('.panel-body')) return; // 已處理
    const title=panel.querySelector('.panel-title');
    if(!title) return;
    const body=document.createElement('div');
    body.className='panel-body';
    // 移動標題後的所有兄弟節點進 body
    let node=title.nextSibling;
    while(node){
      const next=node.nextSibling;
      body.appendChild(node);
      node=next;
    }
    panel.appendChild(body);
    // 命盤 + 輸入 panel 預設展開，其餘摺疊
    if(panel.id!=='chartPanel' && !panel.classList.contains('input-panel')) panel.classList.add('collapsed');
    title.addEventListener('click', ()=>panel.classList.toggle('collapsed'));
  });
}
initCollapse();
let _lastMobile=window.innerWidth<=640;
window.addEventListener('resize', ()=>{ const m=window.innerWidth<=640; if(m!==_lastMobile){ _lastMobile=m; location.reload(); } });

// 多盤對比
function renderCompare(){
  const box=document.getElementById('compareResult');
  const c2y=parseInt(document.getElementById('c2y').value,10);
  const c2m=parseInt(document.getElementById('c2m').value,10);
  const c2d=parseInt(document.getElementById('c2d').value,10);
  const c2h=parseInt(document.getElementById('c2h').value,10);
  const c2g=document.getElementById('c2g').value;
  if(!c2y||!c2m||!c2d){ box.innerHTML='<div class="ft-item"><div class="ft-body">請填第二盤完整生日</div></div>'; return; }
  const b2=solarToAll(c2y,c2m,c2d,c2h);
  if(!b2){ box.innerHTML='<div class="ft-item"><div class="ft-body">第二盤排盤失敗</div></div>'; return; }
  const aYg=document.getElementById('yearGan').value;
  const aYz=document.getElementById('yearZhi').value;
  const aMonth=parseInt(document.getElementById('month').value,10);
  const aHour=parseInt(document.getElementById('hour').value,10);
  const agender=document.getElementById('gender').value;
  const ams=mingShenGong(aMonth, aHour);
  const bms=mingShenGong(b2.month, c2h);
  const CN5=['零','一','二','三','四','五','六'];
  const bjuName=b2.ju+(b2.juNum?CN5[b2.juNum]+'局':'');
  const aju=document.getElementById('ju').value;
  const adx=calcDaxian(aYg, agender, ams.mingZhi, aju);
  const bdx=calcDaxian(b2.yearGan, c2g, bms.mingZhi, bjuName);
  const aBazi=window.__bazi?window.__bazi.map(x=>x.gz).join(' '):'';
  const bBazi=b2.bazi?b2.bazi.map(x=>x.gz).join(' '):'';
  const rows=[
    ['年干', aYg+'（'+GAN_WUXING[aYg]+'）', b2.yearGan+'（'+GAN_WUXING[b2.yearGan]+'）'],
    ['命宮', ams.mingZhi+'宮', bms.mingZhi+'宮'],
    ['五行局', aju, bjuName],
    ['八字', aBazi, bBazi],
    ['命主', MINGZHU[aYz]||'', MINGZHU[b2.yearZhi]||''],
    ['起運', adx.start+'歲', bdx.start+'歲']
  ];
  box.innerHTML='<div class="cm-item cm-head"><span>指標</span><span>第一盤</span><span>第二盤</span></div>'+rows.map(r=>'<div class="cm-item"><span class="cm-key">'+r[0]+'</span><span>'+r[1]+'</span><span>'+r[2]+'</span></div>').join('');
}
document.getElementById('compareBtn').addEventListener('click', renderCompare);

})();
