package com.doctorjava.lms.service;
import com.doctorjava.lms.dto.MockTestDtos.*;
import com.doctorjava.lms.dto.QuestionDtos; import com.doctorjava.lms.entity.*; import com.doctorjava.lms.repository.*; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.time.*; import java.util.*;
import java.math.BigDecimal;
@Service public class MockTestService {
 private final MockTestRepository tests; private final SubjectRepository subjects; private final TopicRepository topics; private final QuestionRepository questionRepo; private final QuestionService qs; private final AttemptRepository attempts; private final AttemptAnswerRepository answers;
 public MockTestService(MockTestRepository t,SubjectRepository s,TopicRepository topics,QuestionRepository q,QuestionService qs,AttemptRepository a,AttemptAnswerRepository ar){tests=t;subjects=s;this.topics=topics;questionRepo=q;this.qs=qs;attempts=a;answers=ar;}
 @Transactional(readOnly=true) public List<TestCardResponse> list(){return tests.findByPublishedTrueOrderByIdDesc().stream().map(this::card).toList();}
 @Transactional(readOnly=true) public TestDetailResponse get(Long id){MockTest t=tests.findById(id).orElseThrow(()->new NoSuchElementException("Test not found")); if(!t.isPublished())throw new NoSuchElementException("Test not found"); return detail(t);}
 @Transactional public TestCardResponse create(TestRequest r){MockTest t=MockTest.builder().testCode("TEST-"+UUID.randomUUID().toString().substring(0,8).toUpperCase()).title(r.title()).description(r.description()).subject(subjects.findById(r.subjectId()).orElseThrow()).difficulty(r.difficulty()).durationMinutes(r.durationMinutes()).totalQuestions(r.questionIds().size()).marksPerQuestion(r.marksPerQuestion()).negativeMarks(r.negativeMarks()).passPercentage(r.passPercentage()).instructions(r.instructions()).published(r.published()).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).questions(new ArrayList<>()).build(); int order=1; for(Long qid:r.questionIds()){Question q=questionRepo.findById(qid).orElseThrow(); if(q.getStatus()!=Question.QuestionStatus.PUBLISHED) throw new IllegalArgumentException("Only published questions can be added to a published test"); t.getQuestions().add(MockTestQuestion.builder().mockTest(t).question(q).displayOrder(order++).build());} return card(tests.save(t)); }
 @Transactional public TestCardResponse update(Long id,TestRequest r){MockTest t=tests.findById(id).orElseThrow();t.setTitle(r.title());t.setDescription(r.description());t.setSubject(subjects.findById(r.subjectId()).orElseThrow());t.setDifficulty(r.difficulty());t.setDurationMinutes(r.durationMinutes());t.setTotalQuestions(r.questionIds().size());t.setMarksPerQuestion(r.marksPerQuestion());t.setNegativeMarks(r.negativeMarks());t.setPassPercentage(r.passPercentage());t.setInstructions(r.instructions());t.setPublished(r.published());t.setUpdatedAt(LocalDateTime.now());t.getQuestions().clear();int order=1;for(Long qid:r.questionIds()){Question q=questionRepo.findById(qid).orElseThrow();t.getQuestions().add(MockTestQuestion.builder().mockTest(t).question(q).displayOrder(order++).build());}return card(tests.save(t));}
 @Transactional public AttemptStartResponse start(Long testId,String studentKey){MockTest t=tests.findById(testId).orElseThrow(); if(!t.isPublished())throw new NoSuchElementException("Test not found"); LocalDateTime start=LocalDateTime.now(); TestAttempt a=TestAttempt.builder().attemptCode("ATT-"+UUID.randomUUID().toString().substring(0,12).toUpperCase()).mockTest(t).studentKey(studentKey).status(TestAttempt.Status.IN_PROGRESS).startedAt(start).expiresAt(start.plusMinutes(t.getDurationMinutes())).questions(new ArrayList<>()).build(); int order=1;List<MockTestQuestion> ordered=new ArrayList<>(t.getQuestions()==null?List.of():t.getQuestions()); for(MockTestQuestion mtq:ordered){Question q=mtq.getQuestion();AttemptQuestion aq=AttemptQuestion.builder().attempt(a).originalQuestionId(q.getId()).questionOrder(order++).questionType(q.getType().name()).questionText(q.getQuestionText()).codeContent(q.getCodeContent()).codeLanguage(q.getCodeLanguage()).topicName(q.getTopic().getName()).difficulty(q.getDifficulty().name()).marks(q.getMarks()).negativeMarks(q.getNegativeMarks()).explanation(q.getExplanation()).options(new ArrayList<>()).build();int oi=1;for(QuestionOption o:q.getOptions()){aq.getOptions().add(AttemptQuestionOption.builder().attemptQuestion(aq).originalOptionId(o.getId()).optionKey(o.getOptionKey()).optionText(o.getOptionText()).displayOrder(oi++).build());}a.getQuestions().add(aq);} TestAttempt saved=attempts.save(a);
  // Use the in-memory questions list (already populated) to avoid null after builder/persist
  List<AttemptQuestion> qsList = saved.getQuestions() != null ? saved.getQuestions() : a.getQuestions();
  if (qsList == null) qsList = List.of();
  return new AttemptStartResponse(saved.getId(),saved.getAttemptCode(),saved.getStartedAt(),saved.getExpiresAt(),t.getDurationMinutes()*60,t.getTitle(),qsList.stream().map(this::studentFromAttempt).toList());}
 @Transactional public void saveAnswer(Long attemptId,Long qid,AnswerRequest r,String studentKey){TestAttempt a=attempts.findByIdAndStudentKey(attemptId,studentKey).orElseThrow(()->new NoSuchElementException("Attempt not found"));ensureActive(a);AttemptQuestion aq=a.getQuestions().stream().filter(q->q.getId().equals(qid)).findFirst().orElseThrow();AttemptAnswer aa=answers.findByAttemptIdAndAttemptQuestionId(a.getId(),aq.getId()).orElseGet(()->AttemptAnswer.builder().attempt(a).attemptQuestion(aq).build());aa.setSelectedOptionId(r.selectedOptionId());aa.setMarkedForReview(Boolean.TRUE.equals(r.markedForReview()));aa.setVisited(Boolean.TRUE.equals(r.visited()));aa.setTimeSpentSeconds(Math.max(0,r.timeSpentSeconds()==null?0:r.timeSpentSeconds())); if(r.selectedOptionId()!=null) aq.getOptions().stream().filter(o->o.getId().equals(r.selectedOptionId())).findFirst().ifPresent(o->aa.setSelectedOptionKey(o.getOptionKey())); answers.save(aa);}
 @Transactional public SubmitResponse submit(Long attemptId,String studentKey){TestAttempt a=attempts.findByIdAndStudentKey(attemptId,studentKey).orElseThrow(); if(a.getStatus()!=TestAttempt.Status.IN_PROGRESS)return result(a); LocalDateTime now=LocalDateTime.now(); boolean auto=now.isAfter(a.getExpiresAt()); BigDecimal score=BigDecimal.ZERO,max=BigDecimal.ZERO;int correct=0,incorrect=0,unanswered=0;List<AnswerReview> reviews=new ArrayList<>();Map<Long,AttemptAnswer> map=new HashMap<>();for(AttemptAnswer x:answers.findByAttemptId(a.getId()))map.put(x.getAttemptQuestion().getId(),x);for(AttemptQuestion q:a.getQuestions()){max=max.add(q.getMarks());AttemptAnswer an=map.get(q.getId());Long selected=an==null?null:an.getSelectedOptionId();AttemptQuestionOption correctOpt = findCorrect(q);boolean isCorrect=selected!=null && correctOpt!=null && selected.equals(correctOpt.getId());BigDecimal awarded;if(selected==null){unanswered++;awarded=BigDecimal.ZERO;}else if(isCorrect){correct++;awarded=q.getMarks();score=score.add(awarded);}else{incorrect++;awarded=q.getNegativeMarks().negate();score=score.add(awarded);}reviews.add(new AnswerReview(q.getId(),q.getQuestionType(),q.getTopicName(),q.getQuestionText(),q.getCodeContent(),q.getCodeLanguage(),q.getOptions().stream().map(o->new com.doctorjava.lms.dto.QuestionDtos.OptionResponse(o.getId(),o.getOptionKey(),o.getOptionText())).toList(),selected,correctOpt==null?null:correctOpt.getId(),selected==null?Boolean.FALSE:isCorrect,q.getExplanation(),awarded));}
 a.setScore(score);a.setMaxScore(max);a.setPercentage(max.signum()==0?BigDecimal.ZERO:score.divide(max,4,java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)));a.setCorrectCount(correct);a.setIncorrectCount(incorrect);a.setUnansweredCount(unanswered);a.setSubmittedAt(now);a.setTimeTakenSeconds(Duration.between(a.getStartedAt(),now).getSeconds());a.setStatus(auto?TestAttempt.Status.AUTO_SUBMITTED:TestAttempt.Status.SUBMITTED);attempts.save(a);
  int passPct = a.getMockTest()!=null ? a.getMockTest().getPassPercentage() : 50;
  return new SubmitResponse(a.getId(),score,max,a.getPercentage(),correct,incorrect,unanswered,a.getPercentage().doubleValue()>=passPct,a.getTimeTakenSeconds(),reviews);}
 private AttemptQuestionOption findCorrect(AttemptQuestion aq){
   Question original = questionRepo.findById(aq.getOriginalQuestionId()).orElse(null);
   if(original==null) return null;
   Long correctId = original.getOptions().stream().filter(QuestionOption::isCorrect).map(QuestionOption::getId).findFirst().orElse(null);
   return aq.getOptions().stream().filter(o -> Objects.equals(o.getOriginalOptionId(), correctId)).findFirst().orElse(null);
 }
 private void ensureActive(TestAttempt a){if(a.getStatus()!=TestAttempt.Status.IN_PROGRESS)throw new IllegalStateException("Attempt is no longer active");if(LocalDateTime.now().isAfter(a.getExpiresAt())){a.setStatus(TestAttempt.Status.AUTO_SUBMITTED);attempts.save(a);throw new IllegalStateException("Test time has expired");}}
 public TestDetailResponse detail(MockTest t){return new TestDetailResponse(t.getId(),t.getTestCode(),t.getTitle(),t.getDescription(),t.getSubject().getName(),t.getDifficulty().name(),t.getDurationMinutes(),t.getTotalQuestions(),t.getMarksPerQuestion(),t.getNegativeMarks(),t.getPassPercentage(),t.getInstructions(),t.getQuestions().stream().map(x->qs.student(x.getQuestion())).toList());}
 private TestCardResponse card(MockTest t){return new TestCardResponse(t.getId(),t.getTestCode(),t.getTitle(),t.getDescription(),t.getSubject().getName(),t.getDifficulty().name(),t.getDurationMinutes(),t.getTotalQuestions(),t.getMarksPerQuestion(),t.getNegativeMarks(),t.getPassPercentage(),t.isPublished());}
 private QuestionDtos.StudentQuestionResponse studentFromAttempt(AttemptQuestion q){return new QuestionDtos.StudentQuestionResponse(q.getId(),q.getQuestionType(),q.getTopicName(),q.getDifficulty(),q.getQuestionText(),q.getCodeContent(),q.getCodeLanguage(),q.getOptions().stream().map(o->new QuestionDtos.OptionResponse(o.getId(),o.getOptionKey(),o.getOptionText())).toList());}
 public TestAttempt loadAttempt(Long id,String studentKey){return attempts.findByIdAndStudentKey(id,studentKey).orElseThrow(()->new NoSuchElementException("Attempt not found"));}
 private SubmitResponse result(TestAttempt a){
  int passPct = a.getMockTest()!=null ? a.getMockTest().getPassPercentage() : 50;
  return new SubmitResponse(a.getId(),a.getScore(),a.getMaxScore(),a.getPercentage(),a.getCorrectCount(),a.getIncorrectCount(),a.getUnansweredCount(),a.getPercentage()!=null&&a.getPercentage().doubleValue()>=passPct,a.getTimeTakenSeconds()==null?0:a.getTimeTakenSeconds(),List.of());
}

 @Transactional(readOnly=true)
 public List<Map<String,Object>> mcqTopics(){
   Map<Long,Long> counts = new HashMap<>();
   for(Object[] row : questionRepo.countPublishedByTopic(Question.QuestionStatus.PUBLISHED)){
     counts.put((Long)row[0], (Long)row[1]);
   }
   List<Map<String,Object>> out = new ArrayList<>();
   for(Topic t : topics.findAllWithSubject()){
     long c = counts.getOrDefault(t.getId(), 0L);
     if(c==0) continue;
     Map<String,Object> m = new LinkedHashMap<>();
     m.put("topicId", t.getId());
     m.put("topicName", t.getName());
     m.put("subjectName", t.getSubject()!=null ? t.getSubject().getName() : "");
     m.put("questionCount", c);
     out.add(m);
   }
   return out;
 }

 @Transactional
 public AttemptStartResponse startTopicPractice(Long topicId, String studentKey){
   Topic topic = topics.findById(topicId).orElseThrow(()->new NoSuchElementException("Topic not found"));
   List<Question> qsList = questionRepo.findByTopicIdAndStatusOrderByIdAsc(topicId, Question.QuestionStatus.PUBLISHED);
   if(qsList.isEmpty()) throw new IllegalArgumentException("No published questions for this topic");
   LocalDateTime start = LocalDateTime.now();
   int duration = Math.max(10, qsList.size() * 2);
   TestAttempt a = TestAttempt.builder()
     .attemptCode("ATT-"+UUID.randomUUID().toString().substring(0,12).toUpperCase())
     .mockTest(null)
     .studentKey(studentKey)
     .practiceTitle(topic.getSubject().getName()+" · "+topic.getName()+" MCQ Practice")
     .status(TestAttempt.Status.IN_PROGRESS)
     .startedAt(start)
     .expiresAt(start.plusMinutes(duration))
     .questions(new ArrayList<>())
     .build();
   int order=1;
   for(Question q : qsList){
     AttemptQuestion aq=AttemptQuestion.builder().attempt(a).originalQuestionId(q.getId()).questionOrder(order++)
       .questionType(q.getType().name()).questionText(q.getQuestionText()).codeContent(q.getCodeContent())
       .codeLanguage(q.getCodeLanguage()).topicName(q.getTopic().getName()).difficulty(q.getDifficulty().name())
       .marks(q.getMarks()).negativeMarks(q.getNegativeMarks()).explanation(q.getExplanation())
       .options(new ArrayList<>()).build();
     int oi=1;
     for(QuestionOption o:q.getOptions()){
       aq.getOptions().add(AttemptQuestionOption.builder().attemptQuestion(aq).originalOptionId(o.getId())
         .optionKey(o.getOptionKey()).optionText(o.getOptionText()).displayOrder(oi++).build());
     }
     a.getQuestions().add(aq);
   }
   TestAttempt saved=attempts.save(a);
   List<AttemptQuestion> list = saved.getQuestions()!=null?saved.getQuestions():a.getQuestions();
   if(list==null) list=List.of();
   String title = saved.getPracticeTitle()!=null?saved.getPracticeTitle():"Topic Practice";
   return new AttemptStartResponse(saved.getId(),saved.getAttemptCode(),saved.getStartedAt(),saved.getExpiresAt(),duration*60,title,list.stream().map(this::studentFromAttempt).toList());
 }

 @Transactional(readOnly=true)
 public List<Map<String,Object>> myAttempts(String studentKey){
   List<Map<String,Object>> out = new ArrayList<>();
   for(TestAttempt a : attempts.findByStudentKeyOrderByStartedAtDesc(studentKey)){
     Map<String,Object> m = new LinkedHashMap<>();
     m.put("attemptId", a.getId());
     m.put("attemptCode", a.getAttemptCode());
     String title = a.getPracticeTitle();
     if(title==null && a.getMockTest()!=null) title = a.getMockTest().getTitle();
     m.put("title", title!=null?title:"Practice");
     m.put("status", a.getStatus().name());
     m.put("startedAt", a.getStartedAt());
     m.put("submittedAt", a.getSubmittedAt());
     m.put("score", a.getScore());
     m.put("maxScore", a.getMaxScore());
     m.put("percentage", a.getPercentage());
     m.put("correctCount", a.getCorrectCount());
     m.put("incorrectCount", a.getIncorrectCount());
     m.put("unansweredCount", a.getUnansweredCount());
     out.add(m);
   }
   return out;
 }


 public void delete(Long id){
   MockTest t = tests.findById(id).orElseThrow(() -> new NoSuchElementException("Test not found"));
   tests.delete(t);
 }
}
