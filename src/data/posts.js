export const topics = [
  {
    slug: 'christianity',
    name: 'Christianity',
    description:
      'Explore the teachings, history, and traditions of Christianity — from the early church fathers to modern denominations and theology.',
    symbol: '✝',
    gradientFrom: '#1e3a5f',
    gradientTo: '#1e40af',
    accentColor: '#3b82f6',
    badgeClass: 'bg-blue-900 text-blue-300 border border-blue-800',
  },
  {
    slug: 'islam',
    name: 'Islam',
    description:
      'Discuss the Quran, Hadith, Islamic jurisprudence, and the rich spiritual and intellectual traditions of the Muslim world.',
    symbol: '☪',
    gradientFrom: '#14532d',
    gradientTo: '#15803d',
    accentColor: '#22c55e',
    badgeClass: 'bg-green-900 text-green-300 border border-green-800',
  },
  {
    slug: 'judaism',
    name: 'Judaism',
    description:
      'Delve into Torah, Talmud, Jewish philosophy, and the enduring heritage of the Jewish people across millennia.',
    symbol: '✡',
    gradientFrom: '#1e1b4b',
    gradientTo: '#3730a3',
    accentColor: '#818cf8',
    badgeClass: 'bg-indigo-900 text-indigo-300 border border-indigo-800',
  },
  {
    slug: 'atheism',
    name: 'Atheism & Secularism',
    description:
      'A space for secular thought, philosophical skepticism, humanism, and evidence-based inquiry into religion and belief.',
    symbol: '⚛',
    gradientFrom: '#1c1c2e',
    gradientTo: '#374151',
    accentColor: '#9ca3af',
    badgeClass: 'bg-gray-800 text-gray-300 border border-gray-700',
  },
]

export const posts = {
  christianity: [
    {
      id: 'c1',
      title: 'The Council of Nicaea and the Formation of Christian Doctrine',
      description:
        'An examination of how the Council of Nicaea in 325 AD shaped the Nicene Creed and established foundational Christian theology regarding the nature of Christ and the Trinity. This post explores the political context of Constantine\'s empire, the Arian controversy, and the lasting legacy of the council\'s decisions on all subsequent Christian thought.',
      author: 'EcumenicalScholar',
      date: '2024-03-12',
      replies: 23,
      views: 412,
      tags: ['History', 'Theology', 'Early Church'],
    },
    {
      id: 'c2',
      title: 'Comparing Protestant and Catholic Interpretations of Grace',
      description:
        'A theological comparison of how Martin Luther\'s doctrine of sola gratia differs from the Catholic understanding of grace and works in the context of salvation. Drawing from Luther\'s Heidelberg Disputation and the Council of Trent, this post maps out where the two traditions genuinely diverge and where modern ecumenism has found common ground.',
      author: 'ReformationReader',
      date: '2024-03-10',
      replies: 41,
      views: 788,
      tags: ['Protestantism', 'Catholicism', 'Reformation'],
    },
    {
      id: 'c3',
      title: 'The Sermon on the Mount: Historical Context and Modern Relevance',
      description:
        'Exploring the ethical teachings of the Sermon on the Mount from both a first-century Jewish context and their application to contemporary Christian ethics. The Beatitudes, the antitheses, and the Lord\'s Prayer are examined as a radical social manifesto rooted in Second Temple Judaism.',
      author: 'BiblicalContext',
      date: '2024-03-08',
      replies: 17,
      views: 305,
      tags: ['New Testament', 'Ethics', 'Jesus'],
    },
    {
      id: 'c4',
      title: 'Eastern Orthodox Mysticism and the Hesychast Tradition',
      description:
        'An introduction to the hesychast tradition in Eastern Orthodox Christianity, including the teachings of Gregory Palamas on the essence-energies distinction, and the transformative practice of the Jesus Prayer (Kyrie eleison) as a path to theosis — union with the divine.',
      author: 'OrthodoxSeeker',
      date: '2024-03-05',
      replies: 9,
      views: 198,
      tags: ['Orthodox', 'Mysticism', 'Spirituality'],
    },
  ],
  islam: [
    {
      id: 'i1',
      title: 'The Five Pillars: Practice, Meaning, and Inner Dimension',
      description:
        'A comprehensive look at Shahada, Salat, Zakat, Sawm, and Hajj — exploring not just their outward observance but their inner spiritual significance in Islamic theology. Each pillar is examined through classical fiqh and the spiritual commentary of scholars like Al-Ghazali.',
      author: 'QuranicStudies',
      date: '2024-03-14',
      replies: 35,
      views: 621,
      tags: ['Pillars', 'Practice', 'Theology'],
    },
    {
      id: 'i2',
      title: "Sufism and the Path of the Heart: Rumi's Masnavi",
      description:
        "An exploration of Jalal ad-Din Rumi's Masnavi as a guide to Sufi thought, divine love (ishq), and the mystical dimensions of Islamic spirituality. The post traces the allegory of the reed flute and examines how Rumi synthesized Quranic themes with Persian poetic tradition.",
      author: 'MysticPath',
      date: '2024-03-11',
      replies: 28,
      views: 509,
      tags: ['Sufism', 'Poetry', 'Mysticism'],
    },
    {
      id: 'i3',
      title: 'Sunni and Shia Traditions: Understanding the Historical Divide',
      description:
        'A historical and theological overview of the origins of the Sunni-Shia split following the death of the Prophet Muhammad, the question of succession, and the martyrdom of Husayn at Karbala. The post examines how this divide shaped distinct juridical schools, ritual calendars, and theological emphases.',
      author: 'IslamicHistory',
      date: '2024-03-09',
      replies: 52,
      views: 934,
      tags: ['History', 'Sunni', 'Shia'],
    },
    {
      id: 'i4',
      title: 'The Islamic Golden Age: Philosophy, Science, and Translation',
      description:
        'How scholars like Avicenna, Al-Kindi, and Al-Farabi preserved and advanced Greek philosophy while making original contributions to medicine, mathematics, optics, and astronomy. This post covers the House of Wisdom in Baghdad and the role of Islamic scholarship in transmitting knowledge to medieval Europe.',
      author: 'GoldenAgeScholar',
      date: '2024-03-06',
      replies: 19,
      views: 387,
      tags: ['History', 'Philosophy', 'Science'],
    },
  ],
  judaism: [
    {
      id: 'j1',
      title: 'The Talmud: A Living Conversation Across the Centuries',
      description:
        'An introduction to the Talmud as a dynamic, multi-layered text — the structure of Mishnah and Gemara, the role of rabbinic debate (machloket), and how Talmudic study (Talmud Torah) remains central to Jewish intellectual and spiritual life today. Includes a walkthrough of a sample sugya.',
      author: 'TorahLearner',
      date: '2024-03-13',
      replies: 31,
      views: 555,
      tags: ['Talmud', 'Rabbinics', 'Study'],
    },
    {
      id: 'j2',
      title: 'Kabbalah and the Tree of Life: Mystical Dimensions of Judaism',
      description:
        'Exploring the Kabbalistic tradition, the ten Sefirot of the Etz Chaim (Tree of Life), and how the Zohar — attributed to Shimon bar Yochai — opened new dimensions of Jewish theological and mystical thought. The post also covers the influence of Lurianic Kabbalah and its concept of tikkun olam.',
      author: 'MysticalJudaism',
      date: '2024-03-10',
      replies: 22,
      views: 431,
      tags: ['Kabbalah', 'Mysticism', 'Zohar'],
    },
    {
      id: 'j3',
      title: 'Reform, Conservative, and Orthodox: Navigating Modern Jewish Identity',
      description:
        'A look at how the three major modern Jewish movements emerged in response to Enlightenment challenges and modernity, and how they differ in their approach to halakha, theology, gender roles, and practice. Includes perspectives from Reconstructionist and Renewal Judaism as well.',
      author: 'JewishModernity',
      date: '2024-03-07',
      replies: 44,
      views: 712,
      tags: ['Movements', 'Identity', 'Modern Judaism'],
    },
    {
      id: 'j4',
      title: 'Passover and the Seder: Layers of Memory, Freedom, and Hope',
      description:
        'Examining the Haggadah and the Passover Seder as a living ritual that connects Jewish communities across time to the Exodus narrative and the promise of future redemption. The post explores how the Seder\'s structure embodies the rabbinic principle: "In every generation, each person is obligated to see themselves as if they personally left Egypt."',
      author: 'HolidayScholar',
      date: '2024-03-04',
      replies: 16,
      views: 289,
      tags: ['Passover', 'Ritual', 'Exodus'],
    },
  ],
  atheism: [
    {
      id: 'a1',
      title: 'The Problem of Evil: Logical and Evidential Arguments',
      description:
        'A philosophical analysis of both the logical problem of evil (Mackie, 1955) and the evidential problem of evil (Rowe, 1979), and how theists have responded with theodicies including free will defenses, soul-making theodicies, and skeptical theism. Assesses the current state of the debate in analytic philosophy of religion.',
      author: 'PhilosophyFirst',
      date: '2024-03-15',
      replies: 67,
      views: 1102,
      tags: ['Philosophy', 'Theodicy', 'Argument'],
    },
    {
      id: 'a2',
      title: 'Secular Humanism as a Coherent Ethical Framework',
      description:
        'How secular humanism provides a robust basis for morality, human rights, and social values without appealing to divine command theory or religious foundations. The post examines the work of the American Humanist Association and philosophers like Paul Kurtz, and responds to the common charge that atheism cannot ground objective ethics.',
      author: 'HumanistVoice',
      date: '2024-03-12',
      replies: 39,
      views: 654,
      tags: ['Humanism', 'Ethics', 'Secular'],
    },
    {
      id: 'a3',
      title: 'Cognitive Science of Religion: Why Do Humans Believe?',
      description:
        'Exploring what evolutionary psychology and cognitive science reveal about the origins of religious belief — from hyperactive agent detection (HADD) and coalitionary bonding to existential meaning-making. Draws on the work of Pascal Boyer, Jesse Bering, and Daniel Dennett to ask whether religion is a byproduct or adaptation.',
      author: 'CogSciNerd',
      date: '2024-03-09',
      replies: 28,
      views: 503,
      tags: ['Science', 'Psychology', 'Evolution'],
    },
    {
      id: 'a4',
      title: "Reformed Epistemology and Its Critics: Is Belief in God 'Properly Basic'?",
      description:
        "Examining Alvin Plantinga's reformed epistemology — the claim that belief in God can be a properly basic belief warranted without argument — and the responses from atheist philosophers including Michael Martin and Graham Oppy. Considers whether the Great Pumpkin objection is a decisive rebuttal or a misunderstanding of Plantinga's project.",
      author: 'EpistemicSkeptic',
      date: '2024-03-06',
      replies: 33,
      views: 571,
      tags: ['Epistemology', 'Philosophy', 'Debate'],
    },
  ],
}
