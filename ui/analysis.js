/* 紫微斗数 · 财运 & 命运分析 */
(function (root) {
  'use strict';

  // ---------- 星曜财运特质 ----------
  var STAR_WEALTH = {
    '紫微':'帝座坐财，财源正大，格局高者能聚大财',
    '天机':'机智生财，宜以智谋、专业、灵活方式求财',
    '太阳':'名声生财，宜以名望、专业、公众服务取财',
    '武曲':'正财之星，理财务实果断，宜实业与稳健投资',
    '天同':'福泽聚财，财运平稳，宜稳中求进',
    '廉贞':'才艺生财，善交际取财，惟财来财去宜守',
    '天府':'库藏之星，善于积财守财，宜置产保值',
    '太阴':'田宅主财，宜房产、稳定理财，收入细水长流',
    '贪狼':'偏财之星，交际生财，机会多但波动较大',
    '巨门':'口舌生财，宜以口才、专业咨询取财',
    '天相':'辅佐聚财，宜合作、代理、协理得财',
    '天梁':'荫星聚财，宜稳定正业、长辈提携',
    '七杀':'开创生财，宜创业、开拓，财随事业成败',
    '破军':'变动生财，财源多变，宜破旧立新'
  };

  // ---------- 宫位主题 ----------
  var PALACE_THEME = {
    '命宫':'一生格局与性格枢纽',
    '兄弟':'手足缘分与平辈助力',
    '夫妻':'婚姻感情与配偶关系',
    '子女':'子嗣缘分与晚辈',
    '财帛':'财禄进出与理财方式',
    '疾厄':'健康体质与潜在隐忧',
    '迁移':'外出际遇与环境变动',
    '仆役':'人际往来与合作夥伴',
    '官禄':'事业发展与社会地位',
    '田宅':'房产积蓄与家庭根基',
    '福德':'精神享受与福分根基',
    '父母':'长上缘分与早年环境'
  };

  // ---------- 四化含义 ----------
  var SIHUA_MEAN = {
    '禄':'生旺、顺利、得助',
    '权':'主导、掌权、推进',
    '科':'名声、文书、贵人',
    '忌':'牵制、困扰、执着'
  };

  function wealthOf(chart) {
    var out = { items: [], score: 0, tags: [] };
    var cp = null, fp = null;
    chart.palaces.forEach(function (p) {
      if (p.name === '财帛') cp = p;
      if (p.name === '命宫') fp = p;
    });
    if (!cp) return out;

    // 1. 财帛宫主星
    var majors = (cp.stars || []).filter(function (s) { return STAR_WEALTH[s]; });
    if (majors.length) {
      majors.forEach(function (s) {
        out.items.push({ k: '财帛宫 · ' + s, v: STAR_WEALTH[s] });
      });
      out.score += 12 * majors.length;
    } else {
      out.items.push({ k: '财帛宫', v: '无主星坐守，财运需靠自身经营，宜稳健积累' });
      out.score += 5;
    }

    // 2. 三方四正（财帛对宫=福德；三合=命宫、官禄）
    var sf = ['命宫', '官禄', '福德'];
    sf.forEach(function (nm) {
      var p = chart.palaces.filter(function (x) { return x.name === nm; })[0];
      if (!p) return;
      (p.stars || []).filter(function (s) { return STAR_WEALTH[s]; }).forEach(function (s) {
        out.items.push({ k: nm + ' · ' + s, v: STAR_WEALTH[s] });
        out.score += 6;
      });
    });

    // 3. 财帛宫辅星
    var aux = cp.aux || [];
    if (aux.indexOf('禄存') >= 0) { out.items.push({ k: '财帛宫 · 禄存', v: '财库有守，利于储蓄保值，正财稳定' }); out.score += 15; out.tags.push('财库稳'); }
    if (aux.indexOf('文昌') >= 0 || aux.indexOf('文曲') >= 0) { out.items.push({ k: '财帛宫 · 文昌/文曲', v: '才学文书生财，利于专业与文职' }); out.score += 8; out.tags.push('文书财'); }
    if (aux.indexOf('擎羊') >= 0 || aux.indexOf('陀羅') >= 0) { out.items.push({ k: '财帛宫 · 擎羊/陀罗', v: '财帛有煞，谨防破耗、投资失利' }); out.score -= 10; out.tags.push('防破耗'); }
    if (aux.indexOf('火星') >= 0 || aux.indexOf('鈴星') >= 0) { out.items.push({ k: '财帛宫 · 火星/铃星', v: '财来急去急，宜防冲动消费与投机' }); out.score -= 8; out.tags.push('忌投机'); }
    if (aux.indexOf('地空') >= 0 || aux.indexOf('地劫') >= 0) { out.items.push({ k: '财帛宫 · 地空/地劫', v: '财库有漏，宜守不宜大额冒险，可置产保值' }); out.score -= 10; out.tags.push('防漏财'); }

    // 4. 本命四化落财帛
    var sh = chart.sihua || {};
    var names = { '禄': sh.禄, '权': sh.权, '科': sh.科, '忌': sh.忌 };
    Object.keys(names).forEach(function (k) {
      var star = names[k];
      if (!star) return;
      var onWealth = (cp.stars || []).indexOf(star) >= 0;
      if (onWealth) {
        var good = (k === '禄' || k === '权' || k === '科');
        out.items.push({ k: '化' + k + '入财帛 · ' + star, v: good ? ('主财源' + SIHUA_MEAN[k]) : ('财帛化忌，主' + SIHUA_MEAN[k] + '，宜保守理财') });
        out.score += good ? 12 : -12;
        out.tags.push(k === '禄' ? '财旺' : k === '忌' ? '财需守' : '财有助');
      }
    });

    // 5. 大限财运
    if (chart.daxian && chart.daxian.res) {
      var dl = chart.daxian.res.filter(function (r) { return r.name === '财帛' || r.name === '財帛'; })[0];
      if (dl) out.items.push({ k: '大限财运', v: '第 ' + (Math.floor((dl.startAge - chart.daxian.start) / 10) + 1) + ' 限（' + dl.startAge + '–' + (dl.startAge + 9) + ' 岁）行至财帛宫，此十年财运主题突出' });
    }

    // 6. 等级
    if (out.score >= 45) out.level = '上吉';
    else if (out.score >= 25) out.level = '中吉';
    else if (out.score >= 10) out.level = '平稳';
    else out.level = '宜守';

    return out;
  }

  // ---------- 命运（大限 + 流年） ----------
  function fateOf(chart, age) {
    var out = { daxian: [], liunian: null, current: null };
    var dx = chart.daxian;
    if (!dx) return out;

    dx.res.forEach(function (r, i) {
      out.daxian.push({
        idx: i + 1,
        name: r.name,
        zhi: r.zhi,
        start: r.startAge,
        end: r.startAge + 9,
        isCurrent: age ? (age >= r.startAge && age <= r.startAge + 9) : false
      });
    });

    if (age) {
      out.current = out.daxian.filter(function (d) { return d.isCurrent; })[0] || null;
      // 流年：以虚岁推算当年地支（出生年支 + 岁数-1）
      var yz = chart.yearGanZhi.charAt(1);
      var ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
      var GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
      var zi = ZHI.indexOf(yz);
      var gi = GAN.indexOf(chart.yearGanZhi.charAt(0));
      var liuZhi = ZHI[((zi + age - 1) % 12 + 12) % 12];
      var liuGan = GAN[((gi + age - 1) % 10 + 10) % 10];
      var SIHUA = chart.sihua; // 本命四化基准（流年四化需流年干，此处给本命做参照）
      out.liunian = {
        gan: liuGan, zhi: liuZhi,
        palace: (function () {
          var p = chart.palaces.filter(function (x) { return x.zhi === liuZhi; })[0];
          return p ? p.name : '?';
        })()
      };
    }
    return out;
  }

  root.ZiweiAnalysis = { wealthOf: wealthOf, fateOf: fateOf, STAR_WEALTH: STAR_WEALTH, PALACE_THEME: PALACE_THEME };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.ZiweiAnalysis;
})(typeof window !== 'undefined' ? window : this);
