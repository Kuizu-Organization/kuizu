package com.kuizu.backend.config;

import com.kuizu.backend.entity.Flashcard;
import com.kuizu.backend.entity.FlashcardSet;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.repository.FlashcardRepository;
import com.kuizu.backend.repository.FlashcardSetRepository;
import com.kuizu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.ArrayList;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class JPD123Initializer {

    private final UserRepository userRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final FlashcardRepository flashcardRepository;

    @Bean
    @org.springframework.core.annotation.Order(2)
    @Profile("!test")
    public CommandLineRunner initJPD123Data() {
        return args -> {
            if (flashcardSetRepository.findByTitle("Từ Vựng JPD123 - Phần 1").isPresent()) {
                return;
            }

            User owner = userRepository.findByUsername("student1").orElse(null);
            if (owner == null) return;

            List<Flashcard> flashcards = new ArrayList<>();

            // Set 1 (0-64)
            FlashcardSet set1 = createSet(owner, "Từ Vựng JPD123 - Phần 1");
            addCardsSet1(set1, flashcards);

            // Set 2 (65-130)
            FlashcardSet set2 = createSet(owner, "Từ Vựng JPD123 - Phần 2");
            addCardsSet2(set2, flashcards);

            // Set 3 (131-195)
            FlashcardSet set3 = createSet(owner, "Từ Vựng JPD123 - Phần 3");
            addCardsSet3(set3, flashcards);

            // Set 4 (196-258)
            FlashcardSet set4 = createSet(owner, "Từ Vựng JPD123 - Phần 4");
            addCardsSet4(set4, flashcards);

            flashcardRepository.saveAll(flashcards);
            System.out.println("JPD123 flashcards initialized (4 sets, Total " + flashcards.size() + " cards)!");
        };
    }

    private FlashcardSet createSet(User owner, String title) {
        FlashcardSet set = FlashcardSet.builder()
                .owner(owner)
                .title(title)
                .description("Japanese vocabulary for JPD123 course.")
                .visibility(com.kuizu.backend.entity.enumeration.Visibility.PUBLIC)
                .status(com.kuizu.backend.entity.enumeration.ModerationStatus.APPROVED)
                .isDeleted(false)
                .version(1)
                .build();
        return flashcardSetRepository.save(set);
    }

    private void addCardsSet1(FlashcardSet set, List<Flashcard> list) {
        list.add(Flashcard.builder().flashcardSet(set).term("ベトナム語 (ご) [betonamugo]").definition("tiếng Việt").orderIndex(0).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("チョコレート [chokorēto]").definition("sô-cô-la").orderIndex(1).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("美術館 (びじゅつかん) [bijutsukan]").definition("bảo tàng mỹ thuật").orderIndex(2).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("皆さん (みなさん) [minasan]").definition("các bạn, quý vị").orderIndex(3).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("いろいろ (な) [iroiro(na)]").definition("nhiều").orderIndex(4).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("～から来ました (きました) [~kara kimashita]").definition("đến từ ~").orderIndex(5).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ぜひ来てください (きてください) [zehi kite kudasai]").definition("rất mong anh/chị đến").orderIndex(6).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("北 (きた) [kita]").definition("bắc").orderIndex(7).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("南 (みなみ) [minami]").definition("nam").orderIndex(8).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("東 (ひがし) [higashi]").definition("đông").orderIndex(9).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("西 (にし) [nishi]").definition("tây").orderIndex(10).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("真ん中 (まんなか) [mannaka]").definition("giữa").orderIndex(11).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("車 (くるま) [kuruma]").definition("xe ô-tô").orderIndex(12).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("新幹線 (しんかんせん) [shinkansen]").definition("tàu cao tốc").orderIndex(13).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("電車 (でんしゃ) [densha]").definition("tàu điện").orderIndex(14).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("飛行機 (ひこうき) [hikouki]").definition("máy bay").orderIndex(15).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("駅 (えき) [eki]").definition("nhà ga").orderIndex(16).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("町 (まち) [machi]").definition("thành phố / khu phố").orderIndex(17).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("～時間 (じかん) [~jikan]").definition("~ tiếng").orderIndex(18).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("～時間半 (じかんはん) [~jikanhan]").definition("~ tiếng rưỡi").orderIndex(19).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("～分 (ふん) [~fun]").definition("~ phút").orderIndex(20).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("歩いて (あるいて) [aruite]").definition("đi bộ").orderIndex(21).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("～くらい [~kurai]").definition("khoảng").orderIndex(22).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("どのくらい [donokurai]").definition("khoảng bao nhiêu").orderIndex(23).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("温泉 (おんせん) [onsen]").definition("suối nước nóng").orderIndex(24).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("川 (かわ) [kawa]").definition("sông").orderIndex(25).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("山 (やま) [yama]").definition("núi").orderIndex(26).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("教 会 (きょうかい) [kyoukai]").definition("nhà thờ").orderIndex(27).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("城 (しろ) [shiro]").definition("lâu đài").orderIndex(28).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("神社 (じんじゃ) [jinja]").definition("đền thần đạo").orderIndex(29).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("寺 (てら) [tera]").definition("chùa").orderIndex(30).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ビル [biru]").definition("tòa nhà").orderIndex(31).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ところ [tokoro]").definition("nơi").orderIndex(32).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("人 (ひと) [hito]").definition("người").orderIndex(33).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("緑 (みどり) [midori]").definition("màu xanh").orderIndex(34).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("あります (ある) [arimasu(aru)]").definition("có").orderIndex(35).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("新しい (あたらしい) [atarashii]").definition("mới").orderIndex(36).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("古い (ふるい) [furui]").definition("cũ").orderIndex(37).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("いい [ii]").definition("tốt").orderIndex(38).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("多い (おおい) [ooi]").definition("nhiều").orderIndex(39).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("少ない (すくない) [sukunai]").definition("ít").orderIndex(40).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("大きい (おおきい) [ookii]").definition("to").orderIndex(41).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("小さい (ちいさい) [chiisai]").definition("nhỏ").orderIndex(42).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("高い (たかい) [takai]").definition("cao").orderIndex(43).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("富士山 (ふじさん) [fujisan]").definition("núi Phú Sĩ").orderIndex(44).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("低い (ひくい) [hikui]").definition("thấp").orderIndex(45).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("きれい (な) [kirei(na)]").definition("đẹp / sạch").orderIndex(46).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("静か (しずか) [shizuka]").definition("yên tĩnh").orderIndex(47).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("にぎやか (な) [nigiyaka(na)]").definition("náo nhiệt").orderIndex(48).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("有名 (ゆうめい) [yuumei]").definition("nổi tiếng").orderIndex(49).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("どんな [donna]").definition("thế nào").orderIndex(50).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("そして [soshite]").definition("và").orderIndex(51).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("雨 (あめ) [ame]").definition("mưa").orderIndex(52).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("雪 (ゆき) [yuki]").definition("tuyết").orderIndex(53).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("日 (ひ) [hi]").definition("ngày").orderIndex(54).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("メロン [meron]").definition("dưa lê").orderIndex(55).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("暖かい (あたたかい) [atatakai]").definition("ấm").orderIndex(56).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("涼しい (すずしい) [suzushii]").definition("mát").orderIndex(57).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("暑い (あつい) [atsui]").definition("nóng").orderIndex(58).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("寒い (さむい) [samui]").definition("lạnh").orderIndex(59).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("天気 (てんき) [tenki]").definition("thời tiết").orderIndex(60).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("熱い (あつい) [atsui]").definition("nóng").orderIndex(61).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("冷たい (つめたい) [tsumetai]").definition("lạnh").orderIndex(62).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("おいしい [oishii]").definition("ngon").orderIndex(63).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("甘い (あまい) [amai]").definition("ngọt").orderIndex(64).isDeleted(false).build());
    }

    private void addCardsSet2(FlashcardSet set, List<Flashcard> list) {
        list.add(Flashcard.builder().flashcardSet(set).term("辛い (からい) [karai]").definition("cay").orderIndex(65).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("苦い (にがい) [nigai]").definition("đắng").orderIndex(66).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("すっぱい [suppai]").definition("chua").orderIndex(67).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("一年中 (いちねんじゅう) [ichinenjuu]").definition("quanh năm").orderIndex(68).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("あまり [amari]").definition("không lắm").orderIndex(69).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("少し (すこし) [sukoshi]").definition("ít").orderIndex(70).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("とても [totemo]").definition("rất").orderIndex(71).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("どう [dou]").definition("thế nào").orderIndex(72).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("そうですね [soudesune]").definition("đúng vậy").orderIndex(73).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("もう一度 (もういちど) [mou ichido]").definition("một lần nữa").orderIndex(74).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("たくさん [takusan]").definition("nhiều").orderIndex(75).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("近く (ちかく) [chikaku]").definition("gần").orderIndex(76).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("1日 (いちにち) [ichinichi]").definition("một ngày").orderIndex(77).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("また [mata]").definition("lại").orderIndex(78).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("今日 (きょう) [kyou]").definition("hôm nay").orderIndex(79).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("明日 (あした) [ashita]").definition("ngày mai").orderIndex(80).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("あさって [asatte]").definition("ngày kia").orderIndex(81).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("昨日 (きのう) [kinou]").definition("hôm qua").orderIndex(82).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("おととい [ototoi]").definition("hôm kia").orderIndex(83).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("先週 (せんしゅう) [senshuu]").definition("tuần trước").orderIndex(84).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("週末 (しゅうまつ) [shuumatsu]").definition("cuối tuần").orderIndex(85).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("家 (いえ) [ie]").definition("nhà").orderIndex(86).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("部屋 (へや) [heya]").definition("phòng").orderIndex(87).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("デパート [depāto]").definition("bách hóa").orderIndex(88).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ゲーム [gēmu]").definition("trò chơi").orderIndex(89).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("家族 (かぞく) [kazoku]").definition("gia đình").orderIndex(90).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("恋人 (こいびと) [koibito]").definition("người yêu").orderIndex(91).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("友達 (ともだち) [tomodachi]").definition("bạn").orderIndex(92).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ルームメイト [rūmumeito]").definition("bạn cùng phòng").orderIndex(93).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("どこか [dokoka]").definition("đâu đó").orderIndex(94).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("会います (あいます) [aimasu]").definition("gặp").orderIndex(95).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("作ります (つくります) [tsukurimasu]").definition("làm").orderIndex(96).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("買い物します (かいものします) [kaimonoshimasu]").definition("mua sắm").orderIndex(97).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("食事します (しょくじします) [shokujishimasu]").definition("ăn").orderIndex(98).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("洗濯します (せんたくします) [sentakushimasu]").definition("giặt").orderIndex(99).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("掃除します (そうじします) [soujishimasu]").definition("dọn dẹp").orderIndex(100).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("それから [sorekara]").definition("sau đó").orderIndex(101).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("一人で (ひとりで) [hitoride]").definition("một mình").orderIndex(102).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("今朝 (けさ) [kesa]").definition("sáng nay").orderIndex(103).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("先月 (せんげつ) [sengetsu]").definition("tháng trước").orderIndex(104).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("去年 (きょねん) [kyonen]").definition("năm ngoái").orderIndex(105).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("風邪 (かぜ) [kaze]").definition("cảm cúm").orderIndex(106).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("晩ご飯 (ばんごはん) [bangohan]").definition("cơm tối").orderIndex(107).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("服 (ふく) [fuku]").definition("quần áo").orderIndex(108).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("登ります (のぼります) [noborimasu]").definition("leo").orderIndex(109).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("入ります (はいります) [hairimasu]").definition("vào").orderIndex(110).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("忙しい (いそがしい) [isogashii]").definition("bận").orderIndex(111).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("おもしろい [omoshiroi]").definition("thú vị").orderIndex(112).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("気持ちがいい (きもちがいい) [kimochi ga ii]").definition("dễ chịu").orderIndex(113).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("高い (たかい) [takai]").definition("đắt").orderIndex(114).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("安い (やすい) [yasui]").definition("rẻ").orderIndex(115).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("楽しい (たのしい) [tanoshii]").definition("vui").orderIndex(116).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("難しい (むずかしい) [muzukashii]").definition("khó").orderIndex(117).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("簡単 (かんたん) [kantan]").definition("đơn giản").orderIndex(118).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("大変 (たいへん) [taihen]").definition("vất vả").orderIndex(119).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("暇 (ひま) [hima]").definition("rảnh").orderIndex(120).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("どうして [doushite]").definition("tại sao").orderIndex(121).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("今度 (こんど) [kondo]").definition("lần tới").orderIndex(122).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("今晩 (こんばん) [konban]").definition("tối nay").orderIndex(123).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("今年 (ことし) [kotoshi]").definition("năm nay").orderIndex(124).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("来年 (らいねん) [rainen]").definition("năm sau").orderIndex(125).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("アニメ [anime]").definition("phim hoạt hình").orderIndex(126).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("絵 (え) [e]").definition("bức tranh").orderIndex(127).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("景色 (けしき) [keshiki]").definition("phong cảnh").orderIndex(128).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("自転車 (じてんしゃ) [jitensha]").definition("xe đạp").orderIndex(129).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("写真 (しゃしん) [shashin]").definition("ảnh").orderIndex(130).isDeleted(false).build());
    }

    private void addCardsSet3(FlashcardSet set, List<Flashcard> list) {
        list.add(Flashcard.builder().flashcardSet(set).term("撮ります (とります) [torimasu]").definition("chụp").orderIndex(131).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("借ります (かります) [karimasu]").definition("mượn").orderIndex(132).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ほしい [hoshii]").definition("muốn").orderIndex(133).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("好き (すき) [suki]").definition("thích").orderIndex(134).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("嫌い (きらい) [kirai]").definition("ghét").orderIndex(135).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("寮 (りょう) [ryou]").definition("ký túc xá").orderIndex(136).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("今週 (こんしゅう) [konshuu]").definition("tuần này").orderIndex(137).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("来週 (らいしゅう) [raishuu]").definition("tuần sau").orderIndex(138).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("今月 (こんげつ) [kongetsu]").definition("tháng này").orderIndex(139).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("来月 (らいげつ) [raigetsu]").definition("tháng sau").orderIndex(140).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("カラオケ [karaoke]").definition("karaoke").orderIndex(141).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("コンサート [konsāto]").definition("hòa nhạc").orderIndex(142).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("試合 (しあい) [shiai]").definition("trận đấu").orderIndex(143).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("セール [sēru]").definition("giảm giá").orderIndex(144).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("チケット [chiketto]").definition("vé").orderIndex(145).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("地図 (ちず) [chizu]").definition("bản đồ").orderIndex(146).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ドライブ [doraibu]").definition("lái xe đi chơi").orderIndex(147).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("水着 (みずぎ) [mizugi]").definition("đồ bơi").orderIndex(148).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("野球 (やきゅう) [yakyuu]").definition("bóng chày").orderIndex(149).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("約束 (やくそく) [yakusoku]").definition("hẹn").orderIndex(150).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("用事 (ようじ) [youji]").definition("công việc").orderIndex(151).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("～枚 (まい) [~mai]").definition("cái (đếm giấy/vé)").orderIndex(152).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("残念 (ざんねん) [zannen]").definition("tiếc").orderIndex(153).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("一緒 (いっしょ) [issho]").definition("cùng").orderIndex(154).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("食べ物 (たべもの) [tabemono]").definition("đồ ăn").orderIndex(155).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("飲み物 (のみもの) [nomimono]").definition("đồ uống").orderIndex(156).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("焼き肉 (やきにく) [yakiniku]").definition("thịt nướng").orderIndex(157).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ラーメン [rāmen]").definition("mì ramen").orderIndex(158).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("食べ放題 (たべほうだい) [tabehoudai]").definition("ăn thỏa thích").orderIndex(159).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("コース [kōsu]").definition("suất / set").orderIndex(160).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("居酒屋 (いざかや) [izakaya]").definition("quán rượu").orderIndex(161).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("映画館 (えいがかん) [eigakan]").definition("rạp phim").orderIndex(162).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("地下鉄 (ちかてつ) [chikatetsu]").definition("tàu điện ngầm").orderIndex(163).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("歌手 (かしゅ) [kashu]").definition("ca sĩ").orderIndex(164).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("季節 (きせつ) [kisetsu]").definition("mùa").orderIndex(165).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("コメディー [komedī]").definition("hài").orderIndex(166).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ジャズ [jazu]").definition("nhạc jazz").orderIndex(167).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ツアー [tsuā]").definition("tour").orderIndex(168).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("どちら [dochira]").definition("cái nào").orderIndex(169).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("どちらも [dochiramo]").definition("cái nào cũng").orderIndex(170).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("近い (ちかい) [chikai]").definition("gần").orderIndex(171).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("遠い (とおい) [tooi]").definition("xa").orderIndex(172).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("早い (はやい) [hayai]").definition("sớm").orderIndex(173).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("広い (ひろい) [hiroi]").definition("rộng").orderIndex(174).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("いちばん [ichiban]").definition("nhất").orderIndex(175).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("全部 (ぜんぶ) [zenbu]").definition("tất cả").orderIndex(176).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("お好み焼き (おこのみやき) [okonomiyaki]").definition("bánh xèo Nhật").orderIndex(177).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("すき焼き (すきやき) [sukiyaki]").definition("lẩu sukiyaki").orderIndex(178).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("遊びます (あそびます) [asobimasu]").definition("chơi").orderIndex(179).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ぜひ [zehi]").definition("nhất định").orderIndex(180).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("まだ [mada]").definition("chưa").orderIndex(181).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("もう [mou]").definition("rồi").orderIndex(182).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("そうしましょう [soushimashou]").definition("chúng ta làm thế").orderIndex(183).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("わかりました [wakarimashita]").definition("hiểu rồi").orderIndex(184).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("店 (みせ) [mise]").definition("cửa hàng").orderIndex(185).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("楽しみです (たのしみです) [tanoshimi desu]").definition("mong đợi").orderIndex(186).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("よかった [yokatta]").definition("tốt").orderIndex(187).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("アパート [apāto]").definition("chung cư").orderIndex(188).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("改札 (かいさつ) [kaisatsu]").definition("cổng soát vé").orderIndex(189).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("木 (き) [ki]").definition("cây").orderIndex(190).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("交番 (こうばん) [kouban]").definition("đồn cảnh sát").orderIndex(191).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("自動販売機 (じどうはんばいき) [jidouhanbaiki]").definition("máy bán hàng tự động").orderIndex(192).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("バス停 (バスてい) [basutei]").definition("trạm xe buýt").orderIndex(193).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ポスト [posuto]").definition("hòm thư").orderIndex(194).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("花 (はな) [hana]").definition("hoa").orderIndex(195).isDeleted(false).build());
    }

    private void addCardsSet4(FlashcardSet set, List<Flashcard> list) {
        list.add(Flashcard.builder().flashcardSet(set).term("犬 (いぬ) [inu]").definition("chó").orderIndex(196).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("間 (あいだ) [aida]").definition("giữa").orderIndex(197).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("上 (うえ) [ue]").definition("trên").orderIndex(198).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("下 (した) [shita]").definition("dưới").orderIndex(199).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("隣 (となり) [tonari]").definition("bên cạnh").orderIndex(200).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("中 (なか) [naka]").definition("trong").orderIndex(201).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("外 (そと) [soto]").definition("ngoài").orderIndex(202).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("前 (まえ) [mae]").definition("trước").orderIndex(203).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("後ろ (うしろ) [ushiro]").definition("sau").orderIndex(204).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("横 (よこ) [yoko]").definition("bên cạnh").orderIndex(205).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("迎えに行きます (むかえにいきます) [mukaeni ikimasu]").definition("đi đón").orderIndex(206).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("います (いる) [imasu(iru)]").definition("ở").orderIndex(207).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("もしもし [moshimoshi]").definition("alô").orderIndex(208).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("いす [isu]").definition("ghế").orderIndex(209).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("テーブル [tēburu]").definition("bàn").orderIndex(210).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("電子レンジ (でんしレンジ) [denshi renji]").definition("lò vi sóng").orderIndex(211).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("冷蔵庫 (れいぞうこ) [reizouko]").definition("tủ lạnh").orderIndex(212).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("砂糖 (さとう) [satou]").definition("đường").orderIndex(213).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("塩 (しお) [shio]").definition("muối").orderIndex(214).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("しょうゆ [shouyu]").definition("nước tương").orderIndex(215).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("コップ [koppu]").definition("cốc").orderIndex(216).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("皿 (さら) [sara]").definition("đĩa").orderIndex(217).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("スプーン [supūn]").definition("thìa").orderIndex(218).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ナイフ [naifu]").definition("dao").orderIndex(219).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("フォーク [fōku]").definition("nĩa").orderIndex(220).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("はし [hashi]").definition("đũa").orderIndex(221).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("漢字 (かんじ) [kanji]").definition("chữ Hán").orderIndex(222).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("どれ [dore]").definition("cái nào").orderIndex(223).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("どの [dono]").definition("cái nào").orderIndex(224).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("洗います (あらいます) [araimasu]").definition("rửa").orderIndex(225).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("置きます (おきます) [okimasu]").definition("đặt").orderIndex(226).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("書きます (かきます) [kakimasu]").definition("viết").orderIndex(227).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("貸します (かします) [kashimasu]").definition("cho mượn").orderIndex(228).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("聞きます (ききます) [kikimasu]").definition("hỏi").orderIndex(229).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("切ります (きります) [kirimasu]").definition("cắt").orderIndex(230).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("使います (つかいます) [tsukaimasu]").definition("dùng").orderIndex(231).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("手伝います (てつだいます) [tetsudaimasu]").definition("giúp").orderIndex(232).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("取ります (とります) [torimasu]").definition("lấy").orderIndex(233).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("持って行きます (もっていきます) [motte ikimasu]").definition("mang đi").orderIndex(234).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("わかります [wakarimasu]").definition("hiểu").orderIndex(235).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("出します (だします) [dashimasu]").definition("lấy ra").orderIndex(236).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("入れます (いれます) [iremasu]").definition("cho vào").orderIndex(237).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("教えます (おしえます) [oshiemasu]").definition("dạy").orderIndex(238).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("すみませんが [sumimasen ga]").definition("xin lỗi").orderIndex(239).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ああ [aa]").definition("à").orderIndex(240).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("いいですよ [ii desu yo]").definition("được").orderIndex(241).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("歌 (うた) [uta]").definition("bài hát").orderIndex(242).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ギター [gitā]").definition("đàn guitar").orderIndex(243).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("台所 (だいどころ) [daidokoro]").definition("bếp").orderIndex(244).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("たばこ [tabako]").definition("thuốc lá").orderIndex(245).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("電話 (でんわ) [denwa]").definition("điện thoại").orderIndex(246).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("ピザ [piza]").definition("pizza").orderIndex(247).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("窓 (まど) [mado]").definition("cửa sổ").orderIndex(248).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("歌います (うたいます) [utaimasu]").definition("hát").orderIndex(249).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("吸います (すいます) [suimasu]").definition("hút").orderIndex(250).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("話します (はなします) [hanashimasu]").definition("nói").orderIndex(251).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("弾きます (ひきます) [hikimasu]").definition("chơi (đàn)").orderIndex(252).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("持ちます (もちます) [mochimasu]").definition("cầm").orderIndex(253).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("開けます (あけます) [akemasu]").definition("mở").orderIndex(254).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("閉めます (しめます) [shimemasu]").definition("đóng").orderIndex(255).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("かけます [kakemasu]").definition("gọi").orderIndex(256).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("持って来ます (もってきます) [motte kimasu]").definition("mang đến").orderIndex(257).isDeleted(false).build());
        list.add(Flashcard.builder().flashcardSet(set).term("お願いします (おねがいします) [onegaishimasu]").definition("nhờ anh/chị").orderIndex(258).isDeleted(false).build());
    }
}
