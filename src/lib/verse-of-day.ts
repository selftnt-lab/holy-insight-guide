// Curated 60 verses for Verse of the Day. Selected by day-of-year mod 60
// so a stable rotation per day. Texts ARA-style summary; reference points to
// the canonical chapter for navigation.

export interface VerseOfDay {
  reference: string;      // e.g. "João 3:16"
  bookSlug: string;       // for nav
  chapter: number;
  verse: number;
  text: string;
}

const VERSES: VerseOfDay[] = [
  { reference: "João 3:16", bookSlug: "john", chapter: 3, verse: 16, text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna." },
  { reference: "Salmos 23:1", bookSlug: "psalms", chapter: 23, verse: 1, text: "O Senhor é o meu pastor; nada me faltará." },
  { reference: "Provérbios 3:5", bookSlug: "proverbs", chapter: 3, verse: 5, text: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento." },
  { reference: "Romanos 8:28", bookSlug: "romans", chapter: 8, verse: 28, text: "Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito." },
  { reference: "Filipenses 4:13", bookSlug: "philippians", chapter: 4, verse: 13, text: "Tudo posso naquele que me fortalece." },
  { reference: "Isaías 41:10", bookSlug: "isaiah", chapter: 41, verse: 10, text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça." },
  { reference: "Jeremias 29:11", bookSlug: "jeremiah", chapter: 29, verse: 11, text: "Porque sou eu que conheço os planos que tenho para vós, diz o Senhor, planos de paz e não de mal, para vos dar um futuro e uma esperança." },
  { reference: "Mateus 11:28", bookSlug: "matthew", chapter: 11, verse: 28, text: "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei." },
  { reference: "Salmos 46:1", bookSlug: "psalms", chapter: 46, verse: 1, text: "Deus é o nosso refúgio e fortaleza, socorro bem presente nas tribulações." },
  { reference: "Provérbios 16:3", bookSlug: "proverbs", chapter: 16, verse: 3, text: "Confia ao Senhor as tuas obras, e os teus desígnios serão estabelecidos." },
  { reference: "1 Coríntios 13:4", bookSlug: "1 corinthians", chapter: 13, verse: 4, text: "O amor é paciente, é benigno; o amor não arde em ciúmes, não se ufana, não se ensoberbece." },
  { reference: "Josué 1:9", bookSlug: "joshua", chapter: 1, verse: 9, text: "Não te mandei eu? Sê forte e corajoso; não temas, nem te espantes, porque o Senhor, teu Deus, é contigo por onde quer que andares." },
  { reference: "Salmos 91:1", bookSlug: "psalms", chapter: 91, verse: 1, text: "O que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará." },
  { reference: "Mateus 6:33", bookSlug: "matthew", chapter: 6, verse: 33, text: "Buscai, pois, em primeiro lugar, o seu reino e a sua justiça, e todas estas coisas vos serão acrescentadas." },
  { reference: "Romanos 12:2", bookSlug: "romans", chapter: 12, verse: 2, text: "E não vos conformeis com este século, mas transformai-vos pela renovação da vossa mente, para que experimenteis qual seja a boa, agradável e perfeita vontade de Deus." },
  { reference: "Salmos 27:1", bookSlug: "psalms", chapter: 27, verse: 1, text: "O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a fortaleza da minha vida; de quem me recearei?" },
  { reference: "1 João 4:8", bookSlug: "1 john", chapter: 4, verse: 8, text: "Aquele que não ama não conhece a Deus, pois Deus é amor." },
  { reference: "Efésios 2:8", bookSlug: "ephesians", chapter: 2, verse: 8, text: "Porque pela graça sois salvos, mediante a fé; e isto não vem de vós; é dom de Deus." },
  { reference: "Hebreus 11:1", bookSlug: "hebrews", chapter: 11, verse: 1, text: "Ora, a fé é a certeza de coisas que se esperam, a convicção de fatos que se não veem." },
  { reference: "Tiago 1:5", bookSlug: "james", chapter: 1, verse: 5, text: "Se, porém, algum de vós necessita de sabedoria, peça-a a Deus, que a todos dá liberalmente e nada lhes impropera; e ser-lhe-á concedida." },
  { reference: "Gálatas 5:22", bookSlug: "galatians", chapter: 5, verse: 22, text: "Mas o fruto do Espírito é: amor, alegria, paz, longanimidade, benignidade, bondade, fidelidade." },
  { reference: "2 Coríntios 5:17", bookSlug: "2 corinthians", chapter: 5, verse: 17, text: "E, assim, se alguém está em Cristo, é nova criatura; as coisas antigas já passaram; eis que se fizeram novas." },
  { reference: "Salmos 37:4", bookSlug: "psalms", chapter: 37, verse: 4, text: "Agrada-te do Senhor, e ele satisfará os desejos do teu coração." },
  { reference: "Provérbios 18:10", bookSlug: "proverbs", chapter: 18, verse: 10, text: "Torre forte é o nome do Senhor; para ela corre o justo e está seguro." },
  { reference: "Isaías 40:31", bookSlug: "isaiah", chapter: 40, verse: 31, text: "Mas os que esperam no Senhor renovarão as suas forças, subirão com asas como águias, correrão e não se cansarão." },
  { reference: "Lamentações 3:22", bookSlug: "lamentations", chapter: 3, verse: 22, text: "As misericórdias do Senhor são a causa de não sermos consumidos, porque as suas misericórdias não têm fim." },
  { reference: "Mateus 5:8", bookSlug: "matthew", chapter: 5, verse: 8, text: "Bem-aventurados os limpos de coração, porque verão a Deus." },
  { reference: "João 14:6", bookSlug: "john", chapter: 14, verse: 6, text: "Respondeu-lhe Jesus: Eu sou o caminho, e a verdade, e a vida; ninguém vem ao Pai senão por mim." },
  { reference: "1 Pedro 5:7", bookSlug: "1 peter", chapter: 5, verse: 7, text: "Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós." },
  { reference: "Salmos 119:105", bookSlug: "psalms", chapter: 119, verse: 105, text: "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho." },
  { reference: "Mateus 28:19", bookSlug: "matthew", chapter: 28, verse: 19, text: "Ide, portanto, fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho, e do Espírito Santo." },
  { reference: "Provérbios 4:23", bookSlug: "proverbs", chapter: 4, verse: 23, text: "Sobre tudo o que se deve guardar, guarda o coração, porque dele procedem as fontes da vida." },
  { reference: "Salmos 34:8", bookSlug: "psalms", chapter: 34, verse: 8, text: "Oh! Provai e vede que o Senhor é bom; bem-aventurado o homem que nele se refugia." },
  { reference: "Romanos 5:8", bookSlug: "romans", chapter: 5, verse: 8, text: "Mas Deus prova o seu próprio amor para conosco pelo fato de ter Cristo morrido por nós, sendo nós ainda pecadores." },
  { reference: "Colossenses 3:23", bookSlug: "colossians", chapter: 3, verse: 23, text: "Tudo quanto fizerdes, fazei-o de todo o coração, como para o Senhor e não para homens." },
  { reference: "1 Tessalonicenses 5:16", bookSlug: "1 thessalonians", chapter: 5, verse: 16, text: "Regozijai-vos sempre. Orai sem cessar. Em tudo, dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco." },
  { reference: "Mateus 7:7", bookSlug: "matthew", chapter: 7, verse: 7, text: "Pedi, e dar-se-vos-á; buscai e achareis; batei, e abrir-se-vos-á." },
  { reference: "Salmos 51:10", bookSlug: "psalms", chapter: 51, verse: 10, text: "Cria em mim, ó Deus, um coração puro e renova dentro de mim um espírito inabalável." },
  { reference: "Provérbios 27:17", bookSlug: "proverbs", chapter: 27, verse: 17, text: "Como o ferro com o ferro se afia, assim, o homem, ao seu amigo." },
  { reference: "João 13:34", bookSlug: "john", chapter: 13, verse: 34, text: "Novo mandamento vos dou: que vos ameis uns aos outros; assim como eu vos amei, que também vos ameis uns aos outros." },
  { reference: "Romanos 10:9", bookSlug: "romans", chapter: 10, verse: 9, text: "Se, com tua boca, confessares Jesus como Senhor e, em teu coração, creres que Deus o ressuscitou dentre os mortos, serás salvo." },
  { reference: "Salmos 139:14", bookSlug: "psalms", chapter: 139, verse: 14, text: "Graças te dou, visto que por modo assombrosamente maravilhoso me formaste; as tuas obras são admiráveis, e a minha alma o sabe muito bem." },
  { reference: "Isaías 26:3", bookSlug: "isaiah", chapter: 26, verse: 3, text: "Tu, Senhor, conservarás em perfeita paz aquele cujo propósito é firme; porque ele confia em ti." },
  { reference: "Filipenses 4:6", bookSlug: "philippians", chapter: 4, verse: 6, text: "Não andeis ansiosos de coisa alguma; em tudo, porém, sejam conhecidas, diante de Deus, as vossas petições, pela oração e pela súplica, com ações de graças." },
  { reference: "2 Timóteo 1:7", bookSlug: "2 timothy", chapter: 1, verse: 7, text: "Porque Deus não nos tem dado espírito de covardia, mas de poder, de amor e de moderação." },
  { reference: "Salmos 121:1", bookSlug: "psalms", chapter: 121, verse: 1, text: "Elevo os olhos para os montes: de onde me virá o socorro? O meu socorro vem do Senhor, que fez o céu e a terra." },
  { reference: "Mateus 22:37", bookSlug: "matthew", chapter: 22, verse: 37, text: "Amarás o Senhor, teu Deus, de todo o teu coração, de toda a tua alma e de todo o teu entendimento." },
  { reference: "Hebreus 13:8", bookSlug: "hebrews", chapter: 13, verse: 8, text: "Jesus Cristo, ontem e hoje, é o mesmo e o será para sempre." },
  { reference: "Apocalipse 3:20", bookSlug: "revelation", chapter: 3, verse: 20, text: "Eis que estou à porta e bato; se alguém ouvir a minha voz e abrir a porta, entrarei em sua casa e cearei com ele, e ele, comigo." },
  { reference: "Salmos 19:14", bookSlug: "psalms", chapter: 19, verse: 14, text: "As palavras dos meus lábios e o meditar do meu coração sejam agradáveis na tua presença, Senhor, rocha minha e redentor meu!" },
  { reference: "Provérbios 22:6", bookSlug: "proverbs", chapter: 22, verse: 6, text: "Ensina a criança no caminho em que deve andar, e, ainda quando for velho, não se desviará dele." },
  { reference: "João 8:32", bookSlug: "john", chapter: 8, verse: 32, text: "E conhecereis a verdade, e a verdade vos libertará." },
  { reference: "Romanos 6:23", bookSlug: "romans", chapter: 6, verse: 23, text: "Porque o salário do pecado é a morte, mas o dom gratuito de Deus é a vida eterna em Cristo Jesus, nosso Senhor." },
  { reference: "Salmos 73:26", bookSlug: "psalms", chapter: 73, verse: 26, text: "Ainda que a minha carne e o meu coração desfaleçam, Deus é a fortaleza do meu coração e a minha herança para sempre." },
  { reference: "Tiago 4:7", bookSlug: "james", chapter: 4, verse: 7, text: "Sujeitai-vos, portanto, a Deus; mas resisti ao diabo, e ele fugirá de vós." },
  { reference: "Eclesiastes 3:1", bookSlug: "ecclesiastes", chapter: 3, verse: 1, text: "Tudo tem o seu tempo determinado, e há tempo para todo propósito debaixo do céu." },
  { reference: "Mateus 5:16", bookSlug: "matthew", chapter: 5, verse: 16, text: "Assim brilhe também a vossa luz diante dos homens, para que vejam as vossas boas obras e glorifiquem a vosso Pai que está nos céus." },
  { reference: "1 Coríntios 10:13", bookSlug: "1 corinthians", chapter: 10, verse: 13, text: "Não vos sobreveio tentação que não fosse humana; mas Deus é fiel e não permitirá que sejais tentados além das vossas forças." },
  { reference: "Salmos 16:11", bookSlug: "psalms", chapter: 16, verse: 11, text: "Tu me farás ver os caminhos da vida; na tua presença há plenitude de alegria, na tua destra, delícias perpetuamente." },
  { reference: "Miquéias 6:8", bookSlug: "micah", chapter: 6, verse: 8, text: "Ele te declarou, ó homem, o que é bom e que é o que o Senhor pede de ti: que pratiques a justiça, e ames a misericórdia, e andes humildemente com o teu Deus." },
  { reference: "Apocalipse 21:4", bookSlug: "revelation", chapter: 21, verse: 4, text: "E lhes enxugará dos olhos toda lágrima, e a morte já não existirá, já não haverá luto, nem pranto, nem dor, porque as primeiras coisas passaram." },
];

function dayOfYear(date: Date): number {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export function getVerseOfDay(date: Date = new Date()): VerseOfDay {
  const idx = dayOfYear(date) % VERSES.length;
  return VERSES[idx];
}
