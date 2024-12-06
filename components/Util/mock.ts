const mockContentString = `RARE: Retrieval-Augmented Reasoning Enhancement
for Large Language Models
Hieu Tran 1, Zonghai Yao 1, Junda Wang 1,Yifan Zhang 3, Zhichao Yang 1, Hong Yu1,2,3,4
1 Manning College of Information and Computer Sciences, University of Massachusetts Amherst, MA, USA
2 Department of Medicine, University of Massachusetts Medical School, Worcester, MA, USA
3 Miner School of Computer and Information Sciences, University of Massachusetts Lowell, MA, USA
4 Center for Healthcare Organization and Implementation Research, VA Bedford Health Care, MA, USA
arXiv:2412.02830v1 [cs.CL] 3 Dec 2024
Abstract
This work introduces RARE (Retrieval-
Augmented Reasoning Enhancement), a ver-
satile extension to the mutual reasoning frame-
work (rStar), aimed at enhancing reasoning ac-
curacy and factual integrity across large lan-
guage models (LLMs) for complex, knowledge-
intensive tasks such as commonsense and med-
ical reasoning. RARE incorporates two in-
novative actions within the Monte Carlo Tree
Search (MCTS) framework: (A6), which gen-
erates search queries based on the initial prob-
lem statement, performs information retrieval
using those queries, and augments reasoning
with the retrieved data to formulate the final an-
swer; and (A7), which leverages information re-
trieval specifically for generated sub-questions
and re-answers these sub-questions with the rel-
evant contextual information. Additionally, a
Retrieval-Augmented Factuality Scorer is pro-
posed to replace the original discriminator, pri-
oritizing reasoning paths that meet high stan-
dards of factuality. Experimental results with
LLaMA 3.1 show that RARE enables open-
source LLMs to achieve competitive perfor-
mance with top open-source models like GPT-4
and GPT-4o. This research establishes RARE
as a scalable solution for improving LLMs in
domains where logical coherence and factual
integrity are critical 1
.
1 Introduction
Question answering (QA) is a cornerstone task in
natural language processing that involves generat-
ing answers to questions posed in natural language.
QA spans a broad spectrum of domains and types,
ranging from open-domain QA (Yang et al., 2018;
Kwiatkowski et al., 2019) to more specialized areas
like medical QA (Jin et al., 2021; Yu and Hatzivas-
siloglou, 2003). The overwhelming volume and
complexity of clinical information necessitate clin-
ical QA, which benefits many downstream tasks
1We will release prompts, codes, and dataset here:
https://github.com/fatebreaker/RARE
such as medical education, clinical decision sup-
port, and patient care optimization (Cai et al., 2023;
Liu et al., 2023; Jin et al., 2024).
Medical QA represents a unique and demand-
ing subset of QA, requiring models to navigate
intricate medical knowledge, interpret clinical sce-
narios, and select correct and contextually appro-
priate options (Singhal et al., 2023b; Wu et al.,
2024). Similar to general domain QA, Medical QA
requires structured multi-step reasoning, where an-
swers emerge from various sequential steps. Take
Figur 1 as an example, to answer appropriate ini-
tial treatment given patient information, the QA
model should first identify patient condition, then
analyze contributing factors and diagnose the dis-
ease, and determine appropriate evidence-based
interventions in the final step. Without such struc-
tured multi-step reasoning, it would be challenging
to arrive at an accurate and contextually relevant
answer for such a complex medical scenario.
Moreover, Medical QA presents several non-
trivial challenges that distinguish it from general-
domain QA. First, Medical QA depends heavily
on domain-specific knowledge that is not always
available within pre-trained models, necessitating
fact-based retrieval from external sources (Xiong
et al., 2024a). An example is questions involve spe-
cific medical terms including heart failure with re-
duced ejection fraction (HFrEF). In addition, medi-
cal knowledge evolves rapidly, and new treatments
or updated guidelines may not be included in the
models pretrained corpus. For example, newer
drugs (like SGLT2 inhibitors for HFrEF) may be
recommended by recent guidelines but absent in
older pre-trained models. Second, Medical QA en-
compasses a wide variety of question types, includ-
ing not only multi-step reasoning and fact-based re-
trieval as previously mentioned, but also questions
requiring iterative evidence retrieval, where they
demand retrieval of relevant knowledge at each
reasoning step to ensure accuracy and relevance
Figure 1: Overview of our reasoning process, which combines generation and factuality scoring. (1) A retrieval-
augmented generator produces multiple candidate reasoning trajectories using Monte Carlo Tree Search (MCTS); (2)
a retrieval-augmented factuality scorer evaluates the factual accuracy of each reasoning trajectory; (3) the trajectory
with the highest factuality score is selected as the final answer.
throughout the process. Third, assessing the factual
accuracy of reasoning steps poses a significant chal-
lenge due to the lack of large-scale datasets with
annotated gold-standard factual scores for these
steps. This scarcity arises because creating such
datasets requires meticulous annotation of each rea-
soning step, which is time-intensive and demands
expert domain knowledge. Due to these challenges,
there has been no evaluation metrics for Medical
QA reasoning steps to the best of our knowledge.
In this paper, we propose Retrieval-Augmented
Reasoning Enhancement (RARE) to handle afore-
mentioned challenges. We built upon existing rStar
(Qi et al., 2024) where a language model gener-
ates reasoning steps and another verifies them, im-
proving accuracy without fine-tuning or superior
models. To generate an effective multi-step reason-
ing path, RARE includes five types of actions to
prompt language model to generate the next rea-
soning step. Actions include proposing a one-step
thought, proposing the remaining thought steps,
asking and answering a sub-question, re-answering
a sub-question, and rephrasing the question. These
actions help the model explore different reason-
ing paths. To answer fact based questions, RARE
also designed a new action A6, which generates
multiple search queries based on the question and
retrieves relevant documents. To answer composite
questions, we add action A7, which refines sub-
questions, retrieves targeted information, and up-
dates the next step. RARE applies the Monte Carlo
Tree Search (MCTS) algorithm to select the best ac-
tion path that leads to the final answer. In addition,
RARE is complemented by Retrieval-Augmented
Factuality Scorer (RAFS) that evaluates and ranks
reasoning paths for factual accuracy.
We applied RARE and other baselines on 3 med-
ical QA tasks and 4 general domain QA tasks. Re-
sults show that RARE significantly enhances ac-
curacy across various LLMs, enabling the open-
source LLM (LLAMA3.1) to achieve competitive
performance with top closed-source large LLM
models like GPT-4 and GPT-4o. Our contributions
are as follows:
1. Formulating Medical QA as Multi-Step Rea-
soning: We build upon the rStar framework to
model medical QA as a structured multi-step rea-
soning task, addressing the complexity and se-
quential nature of medical queries.
2. Novel Retrieval Actions: We introduce two
retrieval-augmented actions within the MCTS
framework, enabling the integration of real-time,
context-specific information to enhance reason-
ing accuracy and relevance.
3. Retrieval-Augmented Factuality Scorer: We
propose a Retrieval-Augmented Factuality Scorer
to evaluate and rank reasoning paths, ensuring
they maintain both logical coherence and factual
reliability throughout the reasoning process.
2 Preliminaries
This section introduces the foundational concepts
and notations used in this work, focusing on the
Monte Carlo Tree Search (MCTS) algorithm and
the rStar framework (Qi et al., 2024), which serve
as the basis for our proposed RARE method.
2.1 Monte Carlo Tree Search (MCTS)
Monte Carlo Tree Search (MCTS) is a decision-
making algorithm widely used in complex decision
processes, such as games, by building a search tree
and simulating outcomes to estimate the value of
potential actions. MCTS operates through four
main phases (Browne et al., 2012).
Selection: Starting from the root node, the algo-
rithm traverses through child nodes based on strate-
gies like the Upper Confidence Bound applied on
Trees (UCT), which balances exploration and ex-
ploitation, continuing until a leaf node is reached.
Expansion: At the leaf node, if it does not rep-
resent a terminal state, one or more feasible child
nodes are added to represent potential future ac-
tions.
Simulation (Evaluation): From one of the newly
added nodes (typically selected randomly), random
simulations (or "rollouts") are performed by select-
ing actions randomly until reaching a terminal state,
thereby estimating the nodes potential.
Backpropagation: After simulation, the results
(win, loss, or draw) are propagated back through
the traversed nodes, updating the statistical data
(e.g., rewards or visit counts) to guide future
decision-making.
By iterating through these phases, MCTS incre-
mentally builds a decision tree, enabling optimal
strategy refinement in scenarios where direct calcu-
lation of the best strategy is infeasible due to a vast
state space.
A crucial component of MCTS is the Upper
Confidence Bound applied on Trees (UCT) algo-
rithm, used during the selection phase to balance
exploration and exploitation. The UCT formula for
choosing actions is defined as follows:
¯
UCTj=
Xj + C 2 ln N
(1)
Nj
where¯
Xj is the average reward of action j, N
is the total visit count of the parent node, Nj is
the visit count of node j, and C is a constant that
controls the balance between exploration and ex-
ploitation.
2.2 Mutual Reasoning Makes Smaller LLMs
Stronger Problem-Solvers
Building upon MCTS, (Qi et al., 2024) proposed
rStar, a framework augments MCTS with a diverse
set of reasoning actions. This enhancement is de-
signed to improve exploration of the solution space
in complex reasoning tasks by allowing more dy-
namic and human-like reasoning pathways. Tradi-
tional approaches, such as Chain of Thought (CoT)
reasoning (Wei et al., 2022) or self-consistency
(Wang et al., 2022), often rely on a single action
type, which can limit the diversity and effectiveness
of generated solutions. In contrast, rStar incorpo-
rates five distinct actions that enable more adaptive
exploration:
A1: Propose a One-Step Thought. This action
generates the next reasoning step based on previ-
ous steps, allowing the LLM to build the solution
incrementally.
A2: Propose Remaining Thought Steps. This
action enables the LLM to produce all remaining
reasoning steps in one inference, similar to CoT,
for simpler questions.
A3: Generate Next Sub-question and Answer.
This action decomposes the main problem into
a sequence of sub-questions, each solved in turn.
A4: Re-answer Sub-question. This action allows
the LLM to re-answer a previously generated sub-
question, increasing accuracy by using few-shot
prompting.
A5: Rephrase Question/Sub-question. This ac-
tion rephrases the question to clarify conditions and
reduce misunderstandings, enhancing the LLMs
interpretation of the problem.
These actions allow rStar to dynamically select
reasoning trajectories, enhancing MCTS-based ex-
ploration of candidate solutions. Additionally, rStar
leverages a reward mechanism to guide tree expan-
sion. Each node sgenerated under action ahas a
reward value Q(s,a). Unexplored nodes are ini-
tialized with Q(si,ai) = 0, leading to random tree
expansions initially. Upon reaching a terminal node
sd, a reward score Q(sd,ad) is computed based on
whether the trajectory reaches the correct answer
and is then back-propagated to each intermediate
node in the trajectory t= x⊕s1 ⊕s2 ⊕...⊕sd.
For each intermediate node si, the reward is up-
dated as Q(si,ai) = Q(si,ai) + Q(sd,ad), with
Q(sd,ad) determined by the likelihood or confi-
dence from self-consistency majority voting. This
reward propagation directs the search toward paths
with higher probabilities of correctness, enhancing
decision-making within the reasoning process.
3 Methodology
3.1 Overview of RARE Framework
Inspired by the generator-discriminator structure of
rStar (Qi et al., 2024), RARE introduces a retrieval-
augmented generator and a factuality scorer to en-
hance reasoning accuracy and factual integrity in
large language models. As illustrated in Figure 1,
RARE operates in two main stages.
Candidate Generation with Retrieval-
Augmented Generator: The retrieval-augmented
generator builds on the MCTS-based rStar
self-generator, incorporating two new retrieval-
augmented actions that dynamically fetch relevant
external information. These actions improve the
relevance and accuracy of candidate reasoning
trajectories by integrating contextually enriched
knowledge into intermediate reasoning steps,
especially for complex questions.
Factuality Evaluation with Retrieval-
Augmented Factuality Scorer: Replacing the
discriminator in rStar, the Retrieval-Augmented
Factuality Scorer evaluates each candidate trajec-
torys factual reliability. This scorer verifies the
alignment of intermediate reasoning steps with
retrieved evidence, assigning a factuality score that
reflects the trajectorys consistency with external
knowledge. The trajectory with the highest
factuality score is selected as the final answer,
prioritizing the most factually supported reasoning
path. This selection ensures coherence and factual
alignment, enhancing response reliability.
Through these stages, RARE systematically in-
tegrates retrieval-based evidence into the reason-
ing process, optimizing both reasoning coherence
and factual accuracy. This approach makes RARE
well-suited for knowledge-intensive tasks, such as
commonsense and medical reasoning.
3.2 Retrieval-Augmented Generator
To enhance the reasoning process with external
knowledge, we introduce two new actions to the
original rStar generator (Qi et al., 2024), transform-
ing it into a Retrieval-Augmented Generator,
as illustrated in Figure 2 and 3. These retrieval-
augmented actions enable the generator to dynami-
cally incorporate external information, improving
both the relevance and accuracy of generated rea-
soning trajectories:
A6: Search Query Generation and Informa-
tion Retrieval. This action prompts the LLM to
construct search queries based on the initial ques-
tion and perform information retrieval. The re-
trieved documents provide additional context that
enriches the reasoning trajectory, supporting the
generator in forming a more comprehensive and
contextually relevant final answer.
A7: Sub-question Retrieval and Re-
Figure 2: Illustration of the proposed retrieval-
augmented action A6 in RARE: Given a question, LLMs
generate search queries and retrieve relevant documents
to construct a contextually enriched final answer. Key
entities are underlined.
answering. This action refines answers to
sub-questions generated through Action A3. For
each sub-question, the generator retrieves specific,
relevant information and uses it to re-answer the
sub-question. This approach enhances the accuracy
of intermediate reasoning steps, thereby improving
the coherence and factual reliability of the entire
reasoning trajectory.
With these retrieval-augmented actions, the gen-
erator can explore a broader solution space, leading
to reasoning paths that are both logically coherent
and enriched with external knowledge. This trans-
formation into a retrieval-augmented generator al-
lows RARE to better handle complex, knowledge-
intensive reasoning tasks.
3.3 Retrieval-Augmented Factuality Scorer
(RAFS)
Inspired by the Search Augmented Factuality Eval-
uator (SAFE) (Wei et al., 2024), which com-
bines an LLM (GPT-3.5-turbo) with Google Search
to evaluate the factuality of responses, RARE
introduces the Retrieval-Augmented Factuality
Scorer (RAFS). RAFS adapts this approach by
replacing GPT-3.5-turbo with LLaMA 3.1 70B
and Google Search with a corpus index retrieval
system containing both general-domain knowl-
edge (Wikipedia) and medical-domain resources
(PubMed, StatPearls, and Medical Textbooks).
Figure 3: Illustration of the proposed retrieval-
augmented action A7 in RARE: LLMs decompose the
question into sub-questions, perform retrieval for each
sub-question, and re-answer them based on the retrieved
documents. The final sub-question is a rephrased ver-
sion of the original question, so the sub-answer to this
final sub-question also serves as the answer to the orig-
inal question. In comparison with previous figure, we
can find that A6 tends to use existing entity from the
main question where A7 tends to use additional entity
from previous subanswer.
This adaptation enhances domain specificity and
accessibility for tasks requiring specialized knowl-
edge.
To assess the factual accuracy of generated rea-
soning paths, RAFS evaluates each candidate tra-
jectory in four systematic steps, as illustrated in
Figure 4.
Split into Statements: Each reasoning trajec-
tory is divided into individual statements. This
segmentation enables RAFS to independently ver-
ify the factual accuracy of discrete reasoning steps,
enhancing the reliability of the overall evaluation.
Generate Retrieval Queries: For each state-
ment, RAFS employs an LLM to generate multiple
retrieval queries designed to retrieve contextually
relevant evidence. These queries target informa-
tion that can either support or refute the content
of each statement, ensuring comprehensive factual
verification.
Retrieve Information: The retrieval system
gathers documents or information that corresponds
to each generated query. This evidence provides a
factual basis for evaluating each reasoning steps
consistency with external sources.
Rate Using Retrieved Information: Each state-
ment is compared against the retrieved evidence
and labeled as either Supported or Not Supported,
based on alignment with the information. The over-
all factuality score for the reasoning path is cal-
culated as the proportion of supported statements,
indicating the trajectorys factual reliability.
As shown in Figure 4, RAFS outputs a factuality
score along with Supported or Not Supported
labels for each statement. This scoring aids in
selecting the most reliable reasoning path from
multiple candidates, allowing RARE to prioritize
responses that align closely with verified external
knowledge.
4 Experiments
In this section, we evaluate the performance of our
proposed method, RARE, on both medical reason-
ing and commonsense reasoning tasks using three
large language models: LLaMA 3.2 3B Instruct,
LLaMA 3.1 8B Instruct and LLaMA 3.1 70B In-
struct (Dubey et al., 2024). Throughout our work,
we may drop “Instruct”, but we are always referring
to the “Instruct” versions.
4.1 Performance on Medical Reasoning tasks
Table 1 shows the performance of RARE and vari-
ous baseline methods on three challenging medical
reasoning benchmarks: MedQA, MedMCQA, and
MMLU-Medical. These datasets require not only
complex reasoning but also a high degree of fac-
tual accuracy, making them suitable for evaluating
the effectiveness of RAREs retrieval-augmented
reasoning approach.
The results demonstrate the effectiveness of
RARE in enhancing the reasoning capabilities
of LLaMA models compared to baseline meth-
ods, including Chain of Thought (CoT), Retrieval-
Augmented Generation (RAG), Self-Consistency,
and rStar. Across all model sizes—LLaMA3.2
3B, LLaMA3.1 8B, and LLaMA3.1 70B—RARE
consistently outperforms baseline methods. The
largest model, LLaMA3.1 70B, achieves the best
results, with RARE scoring 87.43% on MedQA,
74.71% on MedMCQA, and 90.91% on MMLU-
Medical, surpassing all other methods, including
rStar. On LLaMA3.2 3B, RARE improves per-
formance over rStar by 2.59% on MedQA, 2.35%
on MedMCQA, and 1.66% on MMLU-Medical.
Similarly, on LLaMA3.1 8B, RARE achieves sub-
stantial gains, outperforming rStar by 5.17% on
4. Rate using
retrieved information
Given the patients
symptoms of itchy,
watery eyes . . .
The best treatment
for mild allergic
conjunctivitis . . .
Warm compresses
are often recom-
mended . . .
Therefore, warm
compresses would
be the most . . .
Retrieval-Augmented Factuality Scorer (RAFS)
Question
A 35-year-old man
comes . . . Which
of the following is
the most appropri-
ate treatment?
1. Split into
statements
Given the pa-
tients symp-
toms of itchy,
watery eyes. . .
2. Generate re-
trieval queries
Treatment options
for seasonal. . .
Seasonal allergic
conjunctivitis. . .
3. Retrieve
information
. . . control
symptoms such
as sneezing,
itching . . .
The best treat-
ment for mild
allergic con-
junctivitis . . .
Best treatment for
mild allergic. . .
. . . avoiding triggers
lubricating artificial
. . . nedocromil
as mast cell
stabilizers, which
come as eye drops.
Output
Supported: 3
Not Supported: 2
Reasoning
Warm com-
Factuality Score: 0.6
Warm compresses
If the allergen is
Given the patients
symptoms of itchy,
presses are
treatment allergic
encountered and
often recom-
conjunctivitis
the symptoms
watery eyes, sneez-
mended . . .
effectiveness. . .
are mild . . .
ing, and conjuncti-
val . . . The answer
is C: Warm com-
presses.
Therefore,
warm com-
presses would
be the most. . .
Treatment op-
tions for allergic
conjunctivitis. . .
. . . allergic con-
junctivitis may
also require topi-
cal steroid drops.
The answer
is C: Warm
compresses.
Most effective
treatments for allergic
conjunctivitis warm
compresses. . .
. . . stabilizers
can help people
with allergic
conjunctivitis . . .
The answer is C:
Warm compresses.
Figure 4: The Retrieval-Augmented Factuality Scorer (RAFS) assesses the factual accuracy of reasoning paths
in four steps. (1) Split into sentences: The reasoning is divided into individual statements. (2) Generate retrieval
queries: For each statement, an LLM generates multiple search queries aimed at retrieving relevant information. (3)
Retrieve information: The retrieval system gathers supporting information based on these queries. (4) Rate using
retrieved information: Each statement is evaluated against the retrieved information and labeled as Supported or Not
Supported. The final output includes a factuality score, calculated as the proportion of supported statements, which
aids in selecting the most factually reliable reasoning path.
MedQA, 2.19% on MedMCQA, and 2.39% on
MMLU-Medical. The performance improvement
becomes more pronounced as model size increases,
with RARE-enhanced LLaMA3.1 70B outperform-
ing GPT-4 on MedQA (87.43% vs. 83.97%) and
MMLU-Medical (90.91% vs. 89.44%), highlight-
ing its competitive edge. Furthermore, RARE sig-
nificantly outperforms other large models, such as
GPT-3.5, Mixtral, and Meditron, across all bench-
marks. The findings illustrate the scalability and
robustness of RARE in enhancing reasoning and
factual accuracy, with its consistent performance
gains across model sizes and datasets emphasizing
its generalizability.
4.2 Performance on Commonsense Reasoning
Table 2 presents the performance of RARE com-
pared to other reasoning methods and larger lan-
guage models on commonsense reasoning bench-
marks, including StrategyQA, CommonsenseQA,
Social IQA, and Physical IQA. These datasets test a
range of commonsense reasoning skills, with Strat-
egyQA requiring more complex, implicit reasoning,
while the others benefit from advanced reasoning
methods even if they do not strictly require them.
RARE consistently outperforms baseline methods,
including Chain of Thought, Retrieval-Augmented
Generation, Self-Consistency, and rStar, across
both LLaMA3.1 8B and LLaMA3.1 70B models.
For LLaMA3.1 8B, RARE achieves substantial
improvements over rStar, with gains of 6.45% on
StrategyQA, 4.26% on CommonsenseQA, 2.1% on
SIQA, and 1.85% on PIQA. These results high-
light the impact of retrieval-augmented actions
and factuality scoring in addressing complex rea-
soning challenges. On LLaMA3.1 70B, RARE
further closes the gap with state-of-the-art propri-
etary models, achieving 84.72% on StrategyQA,
86.98% on CommonsenseQA, 81.63% on SIQA,
and 92.66% on PIQA, surpassing GPT-4o Mini in
StrategyQA and PIQA while performing closely
to GPT-4o. RARE also consistently outperforms
Claude-3 Haiku and Claude-3.5 Sonnet across all
benchmarks, demonstrating its competitive edge.
The results underscore RAREs scalability and ef-
fectiveness in enhancing commonsense reasoning,
Model Method MedQA MedMCQA MMLU-M
LLaMA3.2 3B
CoT RAG SC rStar RARE 52.63 52.08 56.09 61.27 63.86 49.82 51.78 50.85 54.26 56.61 57.67
67.58
58.49
69.32
70.98
LLaMA3.1 8B
CoT RAG SC rStar RARE 61.51 63 64.73 70.40 75.57 55.15 56.87 56.35 62.13 64.32 71.63
74.56
72.73
79.24
81.63
LLaMA3.1 70B
CoT RAG SC rStar RARE 76.67 77.61 79.49 84.99 87.43 68.75 71.19 70.19 72.72 74.71 81.72
84.76
82.73
88.15
90.91
Meditron 70B CoT 51.69 46.74 64.92
Mixtral (8x7B) CoT 64.10 56.28 74.01
GPT-3.5 CoT 65.04 55.25 72.91
GPT-4 CoT 83.97 69.88 89.44
Table 1: Performance of RARE and baseline methods on
three medical reasoning benchmarks: MedQA, MedM-
CQA, and MMLU-Medical. SC is self-consistency.
enabling open-source models like LLaMA3.1 to
achieve competitive performance with leading pro-
prietary LLMs.
4.3 Ablation Study
To evaluate the contributions of each component
in the RARE framework, we conduct an ablation
study on 250 samples from the MedQA dataset
using the LLaMA 3.1 8B model. Table 3 shows
the accuracy results for different configurations,
isolating the impact of the Retrieval-Augmented
Factuality Scorer and the two retrieval-augmented
actions (A6 and A7).
Starting with the baseline (rStar) at 70.0% ac-
curacy, we observe that adding the Retrieval-
Augmented Factuality Scorer alone results in a
modest increase to 70.6%, suggesting that the fac-
tuality scoring component enhances reasoning reli-
ability. The addition of action A6, which generates
search queries and retrieves relevant information,
raises accuracy to 72.4%, demonstrating the value
of augmenting reasoning paths with external knowl-
edge. Similarly, adding action A7, which retrieves
information for sub-questions and re-answers them,
brings accuracy up to 71.2%, further emphasizing
the benefits of targeted retrieval for improving in-
termediate reasoning steps.
Combining both A6 and A7 yields an
accuracy of 73.2%, showing that the two
retrieval-augmented actions work synergistically
to strengthen the reasoning process by providing
relevant context at multiple stages. Finally, the full
RARE configuration, which includes rStar, both
retrieval-augmented actions (A6 and A7), and the
Model Method SQA CQA SIQA PIQA
LLaMA3.1 8B
CoT RAG SC rStar RARE 67.83 66.08 68.41 71.57 78.02 73.62 74.45 74.90 76.58 80.84 72.01 68.73 72.77 73.69 75.79 76.17
78.67
77.42
84.06
85.91
LLaMA3.1 70B
CoT RAG SC rStar RARE 71.18 75.54 75.84 81.80 84.72 78.62 82.23 78.87 86.16 86.98 78.92 79.12 80.5 80.81 81.63 81.66
86.07
82.67
91.62
92.66
GPT-4o Mini CoT 78.60 82.31 79.94 88.41
GPT-4o CoT 80.64 86.50 81.90 91.13
Claude-3 Haiku CoT 69.58 67.40 64.33 82.32
Claude-3.5 Sonnet CoT 76.86 74.12 67.09 89.39
Table 2: Performance comparison on common sense rea-
soning tasks with various LLMs and reasoning methods,
evaluated on StrategyQA (SQA), CommonsenseQA
(CQA), Social IQA (SIQA), and Physical IQA (PIQA).
SC is self-consistency.
Factuality Scorer, achieves the highest accuracy at
74.8%. This result highlights the effectiveness of
the combined framework, where each component
contributes to the overall improvement in factual
accuracy and reasoning capability.
Configuration Accuracy
rStar 70.0
rStar + RAFS 70.6
rStar + A6 72.4
rStar + A7 71.2
rStar + A6 + A7 73.2
RARE (rStar + A6 + A7 + RAFS) 74.8
Table 3: Ablation study on RARE components, evalu-
ated on 250 MedQA samples using LLaMA 3.1 8B.
5 Related Work
Prompting LLMs to reason has been a focal
point of recent research, particularly through the de-
velopment of prompting-based methods like Chain-
of-Thought (Wei et al., 2022). These approaches
aim to enhance the inference capabilities of LLMs
by designing effective reasoning prompts and se-
quences. Key advancements in this domain include
methods for planning (Hao et al., 2023; Ding et al.,
2023), problem decomposition (Zhou et al., 2022;
Khot et al., 2022), abstraction (Zheng et al., 2023),
and programming (Chen et al., 2022; Zhou et al.,
2023b). Although these techniques have improved
single-step inference significantly, they often rely
on a singular type of operation, which may con-
strain the diversity and effectiveness of generated
solutions. MCTS has emerged as a powerful tool
for optimizing solution paths across a large number
of possible options, enhancing both exploration ef-
ficiency and decision-making quality (Silver et al.,
2018). MCTS has been successfully employed in
various fields, including game theory (Sironi et al.,
2018; Ontanón, 2016), strategic planning (Zhou
et al., 2023a; Yu et al., 2023). When combined
with reinforcement learning, MCTS enables mod-
els to learn through self-play, achieving human-
level or even superhuman performance in com-
plex tasks like Go (Silver et al., 2016). Recent
research has also applied MCTS to LLMs to iden-
tify optimal reasoning pathways, thereby enhanc-
ing performance without requiring additional la-
beled data (Feng et al., 2023; Zhou et al., 2023a;
Tian et al., 2024; Huang et al., 2024). For instance,
Feng et al. (2023) constrained search steps to the
word or sentence level, while Tian et al. (2024)
used ηMCTS for multi-level planning with well-
designed reward signals. Moreover, MCTS has
been utilized to gather high-quality reasoning paths
for training reward models, leading to iterative im-
provements in LLM reasoning (Zhang et al., 2024).
Zhou et al. (2023a) further expanded the use of
MCTS by integrating all potential reasoning and
action steps into the search space, creating a uni-
fied framework for inference, action, and planning
in LLMs. The most relevant work to our study is
rStar, which extends MCTS by incorporating a set
of diverse reasoning operations (Qi et al., 2024).
Medical RAG has proven effective in enhancing
LLM reasoning by grounding it in retrieved, up-
to-date documents, particularly for tasks such as
medical question answering and generation (Xiong
et al., 2024a; Tian et al., 2019; Xia et al., 2022;
Wang et al., 2024; Yao et al., 2024). Applica-
tions also include classification, information ex-
traction, lay language generation (Li et al., 2024;
Guo et al., 2024; Yao et al., 2023), and medical
dialogue (Shi et al., 2024). Enhancements to RAG,
such as query rewriting (Zhang et al., 2022) and
multi-step retrieval (Mrini et al., 2022), enable it-
erative use of retrieved data to improve tasks like
clinical decision-making and literature review (Za-
kka et al., 2024; Wang et al., 2023; Jeong et al.,
2024). For example, Wang et al. (2023) intro-
duced a hybrid retriever with complex filtering for
high-quality documents, while Jeong et al. (2024)
proposed SelfBioRAG, combining retrieval with
self-reflection to enhance reasoning. Iterative RAG
methods, such as i-MedRAG, allow LLMs to pose
follow-up queries iteratively, refining retrieval and
reasoning (Xiong et al., 2024b). The most related
work to RARE is SeRTS (Hu et al., 2024), which
focuses on query generation and optimization via
MCTS, differing from RAREs emphasis on agen-
tic planning. While SeRTS operates like depth-first
search by generating and executing queries step-by-
step, RARE integrates both RAG-based and non-
RAG-based operations, with A6 proposing multi-
ple queries simultaneously (breadth-first search)
for broader exploration. Additionally, RAREs de-
sign allows direct answers for simpler problems
(e.g., step-by-step reasoning or CoT-like genera-
tion), whereas SeRTS strictly follows an iterative
query generation approach. RAREs flexibility en-
ables more comprehensive reasoning and retrieval
capabilities compared to SeRTS.
6 Conclusion
This work introduced RARE (Retrieval-
Augmented Reasoning Enhancement), a
framework designed to improve the reasoning
accuracy and factual reliability of large language
models (LLMs) through retrieval-augmented ac-
tions and factuality scoring. By extending the rStar
framework with two novel retrieval-augmented
actions (A6 and A7) and replacing the original
discriminator with a Retrieval-Augmented Factual-
ity Scorer, RARE enables LLMs to dynamically
retrieve and integrate external knowledge during
inference. This approach ensures that the reasoning
paths produced are both coherent and factually
verified.
RARE operates entirely as a test-time comput-
ing framework, requiring no additional training or
fine-tuning of the underlying LLM. This makes the
framework robust to overfitting and highly adapt-
able across tasks and datasets, as it relies solely
on real-time retrieval and reasoning mechanisms.
Experiments on medical and commonsense rea-
soning benchmarks demonstrate RAREs effective-
ness. On medical reasoning tasks, RARE signif-
icantly outperformed baseline methods and sur-
passed larger models such as GPT-4. On com-
monsense reasoning tasks, RARE outperformed
Claude-3.5 Sonnet and GPT-4o Mini, achieving
performance competitive with GPT-4o.
By enhancing LLMs with retrieval-augmented
reasoning, RARE bridges the gap between open-
source models and state-of-the-art proprietary sys-
tems, showcasing its potential as a scalable and
effective solution for knowledge-intensive reason-
ing tasks.
7 Limitations
While RARE demonstrates significant improve-
ments in reasoning accuracy and factual reliability,
it has certain limitations that present opportunities
for future work.
First, the framework has only been tested on
open-source models like LLaMA 3.1 and not on
larger proprietary models such as GPT-4. This
is due to the high number of API calls required
by RAREs iterative retrieval and reasoning pro-
cess, making evaluations on closed-source models
prohibitively costly. However, the framework is
designed to be model-agnostic and can be directly
applied to proprietary models if resources permit.
Second, RARE is designed to identify a sin-
gle reasoning trajectory that leads to a correct an-
swer but does not necessarily optimize for the best
or shortest path that maximizes robustness (e.g.,
achieving the highest model confidence). Future
work could explore designing better reward func-
tions to prevent reward hacking and improve the
selection of the most reliable reasoning paths.
Additionally, while the Retrieval-Augmented
Factuality Scorer evaluates reasoning paths based
on factual accuracy, the inter-agreement between
RAFS and human evaluations has not been thor-
oughly analyzed. Furthermore, as there are no
established evaluation metrics for assessing the
reasoning steps in Medical QA to the best of our
knowledge, this remains an open challenge for the
research community.
Finally, RARE is currently limited to using
Monte Carlo Tree Search for exploring action paths.
While effective, this approach does not leverage
a trained reward model to dynamically guide the
search process. Future extensions could incor-
porate reward models or alternative optimization
strategies to further enhance reasoning quality and
efficiency.
These limitations highlight areas for improve-
ment and potential research directions to make
RARE more robust, generalizable, and applicable
to a wider range of models and reasoning tasks.
8 Ethics Statement
This work aims to advance the field of Medical QA
by enhancing the reasoning capabilities of language
models through the RARE framework. While the
results demonstrate significant improvements, sev-
eral ethical considerations must be addressed to
ensure responsible development and deployment:
Considering clinical applicability, RARE is de-
signed to improve reasoning and factual reliability
but is not intended to replace healthcare profession-
als or serve as a standalone diagnostic or treatment
tool. Any integration into medical workflows must
be supervised by qualified practitioners to ensure
patient safety and ethical use.
Considering Bias and Fairness, Language mod-
els, including those tested with RARE, may reflect
biases present in their training data. These biases
could impact the fairness and reliability of the rea-
soning process, particularly in sensitive medical
contexts. Future work must include rigorous audits
for bias and fairness to minimize potential harm.
Considering Generalizability, as RARE has been
primarily evaluated in English-language, text-based
general and medical domain QA tasks, its applica-
bility to non-English-speaking contexts and multi-
modal scenarios remains untested. Efforts should
be made to extend the framework to diverse linguis-
tic and cultural contexts to ensure equitable access
to its benefits.
Considering Societal Impacts, while RARE
demonstrates the potential for improving medi-
cal reasoning tasks, its outputs should be consid-
ered supplementary to human expertise. The eth-
ical deployment of RARE requires clear guide-
lines to avoid overreliance on AI and ensure that
it enhances, rather than replaces, human decision-
making in healthcare.
References
Yonatan Bisk, Rowan Zellers, Jianfeng Gao, Yejin Choi,
et al. 2020. Piqa: Reasoning about physical com-
monsense in natural language. In Proceedings of the
AAAI conference on artificial intelligence, volume 34,
pages 7432–7439.
Cameron B Browne, Edward Powley, Daniel White-
house, Simon M Lucas, Peter I Cowling, Philipp
Rohlfshagen, Stephen Tavener, Diego Perez, Spyri-
don Samothrakis, and Simon Colton. 2012. A survey
of monte carlo tree search methods. IEEE Transac-
tions on Computational Intelligence and AI in games,
4(1):1–43.
Pengshan Cai, Zonghai Yao, Fei Liu, Dakuo Wang,
Meghan Reilly, Huixue Zhou, Lingxi Li, Yi Cao,
Alok Kapoor, Adarsha Bajracharya, et al. 2023.
Paniniqa: Enhancing patient education through in-
teractive question answering. Transactions of the
Association for Computational Linguistics, 11:1518–
1536.
Wenhu Chen, Xueguang Ma, Xinyi Wang, and
William W Cohen. 2022. Program of thoughts
prompting: Disentangling computation from reason-
ing for numerical reasoning tasks. arXiv preprint
arXiv:2211.12588.
Ruomeng Ding, Chaoyun Zhang, Lu Wang, Yong Xu,
Minghua Ma, Wei Zhang, Si Qin, Saravan Raj-
mohan, Qingwei Lin, and Dongmei Zhang. 2023.
Everything of thoughts: Defying the law of pen-
rose triangle for thought generation. arXiv preprint
arXiv:2311.04254.
Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey,
Abhishek Kadian, Ahmad Al-Dahle, Aiesha Letman,
Akhil Mathur, Alan Schelten, Amy Yang, Angela
Fan, et al. 2024. The llama 3 herd of models. arXiv
preprint arXiv:2407.21783.
Xidong Feng, Ziyu Wan, Muning Wen, Stephen Marcus
McAleer, Ying Wen, Weinan Zhang, and Jun Wang.
2023. Alphazero-like tree-search can guide large lan-
guage model decoding and training. arXiv preprint
arXiv:2309.17179.
Mor Geva, Daniel Khashabi, Elad Segal, Tushar Khot,
Dan Roth, and Jonathan Berant. 2021. Did aristotle
use a laptop? a question answering benchmark with
implicit reasoning strategies. Transactions of the
Association for Computational Linguistics, 9:346–
361.
Yue Guo, Wei Qiu, Gondy Leroy, Sheng Wang, and
Trevor Cohen. 2024. Retrieval augmentation of large
language models for lay language generation. Jour-
nal of Biomedical Informatics, 149:104580.
Shibo Hao, Yi Gu, Haodi Ma, Joshua Jiahua Hong,
Zhen Wang, Daisy Zhe Wang, and Zhiting Hu. 2023.
Reasoning with language model is planning with
world model. arXiv preprint arXiv:2305.14992.
Minda Hu, Licheng Zong, Hongru Wang, Jingyan Zhou,
Jingjing Li, Yichen Gao, Kam-Fai Wong, Yu Li, and
Irwin King. 2024. Serts: Self-rewarding tree search
for biomedical retrieval-augmented generation. In
Findings of the Association for Computational Lin-
guistics: EMNLP 2024, pages 1321–1335.
Jiatan Huang, Mingchen Li, Zonghai Yao, Zhichao
Yang, Yongkang Xiao, Feiyun Ouyang, Xiaohan
Li, Shuo Han, and Hong Yu. 2024. Ritek: A
dataset for large language models complex reason-
ing over textual knowledge graphs. arXiv preprint
arXiv:2410.13987.
Minbyul Jeong, Jiwoong Sohn, Mujeen Sung, and Jae-
woo Kang. 2024. Improving medical reasoning
through retrieval and self-reflection with retrieval-
augmented large language models. Bioinformatics,
40(Supplement_1):i119–i129.
Di Jin, Eileen Pan, Nassim Oufattole, Wei-Hung Weng,
Hanyi Fang, and Peter Szolovits. 2021. What disease
does this patient have? a large-scale open domain
question answering dataset from medical exams. Ap-
plied Sciences, 11(14):6421.
Qiao Jin, Zifeng Wang, Charalampos S Floudas,
Fangyuan Chen, Changlin Gong, Dara Bracken-
Clarke, Elisabetta Xue, Yifan Yang, Jimeng Sun, and
Zhiyong Lu. 2024. Matching patients to clinical
trials with large language models. Nature Communi-
cations, 15(1):9074.
Omar Khattab and Matei Zaharia. 2020. Colbert: Effi-
cient and effective passage search via contextualized
late interaction over bert. In Proceedings of the 43rd
International ACM SIGIR conference on research
and development in Information Retrieval, pages 39–
48.
Tushar Khot, Harsh Trivedi, Matthew Finlayson, Yao
Fu, Kyle Richardson, Peter Clark, and Ashish Sab-
harwal. 2022. Decomposed prompting: A modular
approach for solving complex tasks. arXiv preprint
arXiv:2210.02406.
Tom Kwiatkowski, Jennimaria Palomaki, Olivia Red-
field, Michael Collins, Ankur Parikh, Chris Alberti,
Danielle Epstein, Illia Polosukhin, Jacob Devlin, Ken-
ton Lee, et al. 2019. Natural questions: a benchmark
for question answering research. Transactions of the
Association for Computational Linguistics, 7:453–
466.
Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio
Petroni, Vladimir Karpukhin, Naman Goyal, Hein-
rich Küttler, Mike Lewis, Wen-tau Yih, Tim Rock-
täschel, et al. 2020. Retrieval-augmented generation
for knowledge-intensive nlp tasks. Advances in Neu-
ral Information Processing Systems, 33:9459–9474.
Mingchen Li, Halil Kilicoglu, Hua Xu, and Rui Zhang.
2024. Biomedrag: A retrieval augmented large
language model for biomedicine. arXiv preprint
arXiv:2405.00465.
Siru Liu, Aileen P Wright, Barron L Patterson,
Jonathan P Wanderer, Robert W Turer, Scott D Nel-
son, Allison B McCoy, Dean F Sittig, and Adam
Wright. 2023. Using ai-generated suggestions from
chatgpt to optimize clinical decision support. Jour-
nal of the American Medical Informatics Association,
30(7):1237–1245.
Khalil Mrini, Harpreet Singh, Franck Dernoncourt, Se-
unghyun Yoon, Trung Bui, Walter Chang, Emilia
Farcas, and Ndapa Nakashole. 2022. Medical ques-
tion understanding and answering with knowledge
grounding and semantic self-supervision. arXiv
preprint arXiv:2209.15301.
Santiago Ontanón. 2016. Informed monte carlo tree
search for real-time strategy games. In 2016
IEEE Conference on Computational Intelligence and
Games (CIG), pages 1–8. IEEE.
Ankit Pal, Logesh Kumar Umapathi, and Malaikan-
nan Sankarasubbu. 2022. Medmcqa: A large-scale
multi-subject multi-choice dataset for medical do-
main question answering. In Conference on health,
inference, and learning, pages 248–260. PMLR.
Zhenting Qi, Mingyuan Ma, Jiahang Xu, Li Lyna Zhang,
Fan Yang, and Mao Yang. 2024. Mutual reasoning
makes smaller llms stronger problem-solvers. arXiv
preprint arXiv:2408.06195.
Maarten Sap, Hannah Rashkin, Derek Chen, Ronan
LeBras, and Yejin Choi. 2019. Socialiqa: Com-
monsense reasoning about social interactions. arXiv
preprint arXiv:1904.09728.
Xiaoming Shi, Zeming Liu, Li Du, Yuxuan Wang, Hon-
gru Wang, Yuhang Guo, Tong Ruan, Jie Xu, and
Shaoting Zhang. 2024. Medical dialogue: A survey
of categories, methods, evaluation and challenges.
arXiv preprint arXiv:2405.10630.
David Silver, Aja Huang, Chris J Maddison, Arthur
Guez, Laurent Sifre, George Van Den Driessche, Ju-
lian Schrittwieser, Ioannis Antonoglou, Veda Pan-
neershelvam, Marc Lanctot, et al. 2016. Mastering
the game of go with deep neural networks and tree
search. nature, 529(7587):484–489.
David Silver, Thomas Hubert, Julian Schrittwieser, Ioan-
nis Antonoglou, Matthew Lai, Arthur Guez, Marc
Lanctot, Laurent Sifre, Dharshan Kumaran, Thore
Graepel, et al. 2018. A general reinforcement learn-
ing algorithm that masters chess, shogi, and go
through self-play. Science, 362(6419):1140–1144.
Karan Singhal, Shekoofeh Azizi, Tao Tu, S Sara Mah-
davi, Jason Wei, Hyung Won Chung, Nathan Scales,
Ajay Tanwani, Heather Cole-Lewis, Stephen Pfohl,
et al. 2023a. Large language models encode clinical
knowledge. Nature, 620(7972):172–180.
Karan Singhal, Tao Tu, Juraj Gottweis, Rory Sayres,
Ellery Wulczyn, Le Hou, Kevin Clark, Stephen
Pfohl, Heather Cole-Lewis, Darlene Neal, et al.
2023b. Towards expert-level medical question an-
swering with large language models. arXiv preprint
arXiv:2305.09617.
Chiara F Sironi, Jialin Liu, Diego Perez-Liebana,
Raluca D Gaina, Ivan Bravi, Simon M Lucas, and
Mark HM Winands. 2018. Self-adaptive mcts for
general video game playing. In International Confer-
ence on the Applications of Evolutionary Computa-
tion, pages 358–375. Springer.
Alon Talmor, Jonathan Herzig, Nicholas Lourie, and
Jonathan Berant. 2018. Commonsenseqa: A question
answering challenge targeting commonsense knowl-
edge. arXiv preprint arXiv:1811.00937.
Ye Tian, Baolin Peng, Linfeng Song, Lifeng Jin, Dian
Yu, Haitao Mi, and Dong Yu. 2024. Toward self-
improvement of llms via imagination, searching, and
criticizing. arXiv preprint arXiv:2404.12253.
Yuanhe Tian, Weicheng Ma, Fei Xia, and Yan Song.
2019. Chimed: A chinese medical corpus for ques-
tion answering. In Proceedings of the 18th BioNLP
Workshop and Shared Task, pages 250–260.
Junda Wang, Zhichao Yang, Zonghai Yao, and Hong
Yu. 2024. Jmlr: Joint medical llm and retrieval
training for enhancing reasoning and professional
question answering capability. arXiv preprint
arXiv:2402.17887.
Xuezhi Wang, Jason Wei, Dale Schuurmans, Quoc Le,
Ed Chi, Sharan Narang, Aakanksha Chowdhery, and
Denny Zhou. 2022. Self-consistency improves chain
of thought reasoning in language models. arXiv
preprint arXiv:2203.11171.
Yubo Wang, Xueguang Ma, and Wenhu Chen. 2023.
Augmenting black-box llms with medical textbooks
for clinical question answering. arXiv preprint
arXiv:2309.02233.
Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten
Bosma, Fei Xia, Ed Chi, Quoc V Le, Denny Zhou,
et al. 2022. Chain-of-thought prompting elicits rea-
soning in large language models. Advances in neural
information processing systems, 35:24824–24837.
Jerry Wei, Chengrun Yang, Xinying Song, Yifeng Lu,
Nathan Hu, Jie Huang, Dustin Tran, Daiyi Peng,
Ruibo Liu, Da Huang, et al. 2024. Long-form fac-
tuality in large language models. arXiv preprint
arXiv:2403.18802.
Chaoyi Wu, Weixiong Lin, Xiaoman Zhang, Ya Zhang,
Weidi Xie, and Yanfeng Wang. 2024. Pmc-llama:
toward building open-source language models for
medicine. Journal of the American Medical Infor-
matics Association, page ocae045.
Fei Xia, Bin Li, Yixuan Weng, Shizhu He, Kang Liu,
Bin Sun, Shutao Li, and Jun Zhao. 2022. Med-
conqa: medical conversational question answering
system based on knowledge graphs. In Proceedings
of the 2022 Conference on Empirical Methods in Nat-
ural Language Processing: System Demonstrations,
pages 148–158.
Guangzhi Xiong, Qiao Jin, Zhiyong Lu, and Aidong
Zhang. 2024a. Benchmarking retrieval-augmented
generation for medicine. arXiv e-prints, pages arXiv–
2402.
Guangzhi Xiong, Qiao Jin, Xiao Wang, Minjia Zhang,
Zhiyong Lu, and Aidong Zhang. 2024b. Im-
proving retrieval-augmented generation in medicine
with iterative follow-up questions. arXiv preprint
arXiv:2408.00727.
Zhilin Yang, Peng Qi, Saizheng Zhang, Yoshua Ben-
gio, William W Cohen, Ruslan Salakhutdinov, and
Christopher D Manning. 2018. Hotpotqa: A dataset
for diverse, explainable multi-hop question answer-
ing. arXiv preprint arXiv:1809.09600.
Zonghai Yao, Nandyala Siddharth Kantu, Guanghao
Wei, Hieu Tran, Zhangqi Duan, Sunjae Kwon,
Zhichao Yang, Hong Yu, et al. 2023. Readme: Bridg-
ing medical jargon and lay understanding for patient
education through data-centric nlp. arXiv preprint
arXiv:2312.15561.
Zonghai Yao, Aditya Parashar, Huixue Zhou, Won Seok
Jang, Feiyun Ouyang, Zhichao Yang, and Hong Yu.
2024. Mcqg-srefine: Multiple choice question gener-
ation and evaluation with iterative self-critique, cor-
rection, and comparison feedback. arXiv preprint
arXiv:2410.13191.
Hong Yu and Vasileios Hatzivassiloglou. 2003. Towards
answering opinion questions: Separating facts from
opinions and identifying the polarity of opinion sen-
tences. In Proceedings of the 2003 conference on
Empirical methods in natural language processing,
pages 129–136.
Xiao Yu, Maximillian Chen, and Zhou Yu. 2023.
Prompt-based monte-carlo tree search for goal-
oriented dialogue policy planning. arXiv preprint
arXiv:2305.13660.
Cyril Zakka, Rohan Shad, Akash Chaurasia, Alex R
Dalal, Jennifer L Kim, Michael Moor, Robyn Fong,
Curran Phillips, Kevin Alexander, Euan Ashley,
et al. 2024. Almanac—retrieval-augmented lan-
guage models for clinical medicine. NEJM AI,
1(2):AIoa2300068.
Dan Zhang, Sining Zhoubian, Ziniu Hu, Yisong Yue,
Yuxiao Dong, and Jie Tang. 2024. Rest-mcts*: Llm
self-training via process reward guided tree search.
arXiv preprint arXiv:2406.03816.
Ming Zhang, Shuai Dou, Ziyang Wang, and Yunfang
Wu. 2022. Focus-driven contrastive learning for med-
ical question summarization. In Proceedings of the
29th international conference on computational lin-
guistics, pages 6176–6186.
Huaixiu Steven Zheng, Swaroop Mishra, Xinyun Chen,
Heng-Tze Cheng, Ed H Chi, Quoc V Le, and Denny
Zhou. 2023. Take a step back: Evoking reasoning via
abstraction in large language models. arXiv preprint
arXiv:2310.06117.
Andy Zhou, Kai Yan, Michal Shlapentokh-Rothman,
Haohan Wang, and Yu-Xiong Wang. 2023a. Lan-
guage agent tree search unifies reasoning acting
and planning in language models. arXiv preprint
arXiv:2310.04406.
Aojun Zhou, Ke Wang, Zimu Lu, Weikang Shi, Sichun
Luo, Zipeng Qin, Shaoqing Lu, Anya Jia, Linqi Song,
Mingjie Zhan, et al. 2023b. Solving challenging
math word problems using gpt-4 code interpreter
with code-based self-verification. arXiv preprint
arXiv:2308.07921.
Denny Zhou, Nathanael Schärli, Le Hou, Jason Wei,
Nathan Scales, Xuezhi Wang, Dale Schuurmans,
Claire Cui, Olivier Bousquet, Quoc Le, et al. 2022.
Least-to-most prompting enables complex reason-
ing in large language models. arXiv preprint
arXiv:2205.10625.
A Appendix
A.1 Implementation Details
In the MCTS framework of the Retrieval-
Agumented Generator, we set the number of roll-
outs to 4 for LLaMA 3.2 3B and LLaMA 3.1 8B
models, and 2 for the LLaMA 3.1 70B model. This
configuration strikes a balance between effective
inference and computational efficiency, particularly
for larger models where inference costs are higher.
In the factuality scoring stage, we perform a
self-scorer setup, where the Retrieval-Augmented
Factuality Scorer uses the same backbone model
as the generator. For instance, when the generator
utilizes LLaMA 3.1 3B, the RAFS also employs
the LLaMA 3.2 3B model for factuality evaluation.
This ensures consistency between the generator and
scorer while maintaining efficient inference. All
inference processes, including factuality scoring,
are parallelized to further enhance efficiency.
A.2 Inference Time Analysis
Table 4 presents the inference costs of RARE on
MedQA for two model sizes: LLaMA3-8B and
LLaMA3-70B. The table reports the average num-
ber of model calls and the total number of tokens
generated per question during the reasoning pro-
cess. For LLaMA3-8B, RARE required an average
of 52.77 calls and generated 135.5k tokens, while
for the larger LLaMA3-70B model, the number
of calls was reduced to 29.20, with 95.3k tokens
generated on average.
These differences in inference costs are a re-
sult of the experimental setup, where the number
of rollouts is set to 4 for LLaMA3-8B and 2 for
LLaMA3-70B. This configuration was designed
to balance computational efficiency and effective
inference, ensuring that both models perform opti-
mally within practical time constraints. The results
demonstrate that RAREs implementation is flexi-
ble and scalable, enabling the use of larger models
like LLaMA3-70B without incurring excessive in-
ference costs while still maintaining high reasoning
accuracy.
LLaMA3-8B LLaMA3-70B
Avg. calls 52.77 29.20
Avg. generated tokens 135.5k 95.3k
Table 4: Inference costs of RARE on MedQA. We show
the average number of inferences and generated tokens
required to answer a question.
A.3 Evaluation tasks
To rigorously test the reasoning capabilities of
RARE, we evaluate it on a range of reasoning tasks,
categorized into two main domains:
Medical Reasoning Tasks: We use three medi-
cal datasets that require complex, domain-specific
reasoning, including:
• MedQA-USMLE (Jin et al., 2021): A med-
ical question-answering dataset based on the
United States Medical Licensing Examination
(USMLE) questions.
• MedMCQA (Pal et al., 2022): A dataset con-
sisting of multiple-choice medical questions
designed to test clinical knowledge.
• MMLU-Medical (Singhal et al., 2023a): The
medical subset of the Massive Multitask Lan-
guage Understanding (MMLU) benchmark,
focusing on diverse topics in the medical field.
Commonsense Reasoning Tasks: We evaluate
RAREs general reasoning ability on commonsense
datasets. While StrategyQA requires complex,
implicit reasoning strategies, other tasks benefit
from advanced reasoning but may not require it to
the same extent:
• StrategyQA (Geva et al., 2021): A dataset of
open-domain questions that require implicit
reasoning strategies.
• CommonsenseQA (Talmor et al., 2018): A
multiple-choice question-answering dataset
designed to test commonsense knowledge.
• PIQA (Physical Interaction QA) (Bisk et al.,
2020): A dataset for physical reasoning,
where models must answer questions about
common physical interactions.
• SIQA (Social IQA) (Sap et al., 2019): A
dataset that tests social and emotional reason-
ing.
A.4 Baselines
We compare the performance of RARE with several
baseline reasoning methods, including:
• Chain of Thought (CoT) (Wei et al., 2022):
A reasoning approach that generates explana-
tions step-by-step, aiming for more coherent
answers.
• Self-Consistency (Wang et al., 2022): A
method that uses majority voting among mul-
tiple reasoning paths to increase response ac-
curacy.
• rStar (Qi et al., 2024): A framework that
extends MCTS with a diverse set of reasoning
actions, improving reasoning accuracy.
• Retrieval-Augmented Generation (RAG)
(Lewis et al., 2020): An approach that incor-
porates retrieval-based information to support
response generation.
A.5 Retrieval Model and Corpus
For information retrieval, we use the MedCorp cor-
pus, a domain-specific collection of high-quality
and uptodate sources that include:
• Wikipedia: A general knowledge resource
with broad coverage of diverse topics.
• PubMed: A database of biomedical and life
sciences literature.
• Medical Textbooks: Authoritative resources
for foundational medical knowledge.
• StatPearls: A database of peer-reviewed med-
ical topics, frequently used for medical educa-
tion.
To retrieve relevant information from this corpus,
we employ the ColBERT retrieval model (Khattab
and Zaharia, 2020), which is optimized for passage
retrieval and relevance scoring. ColBERT enables
our retrieval-augmented generator to efficiently lo-
cate and incorporate contextually relevant informa-
tion, enhancing the factual accuracy of generated
responses.
A.6 Evaluation of Reasoning Candidates with
RAFS
Figure 5 demonstrates how the Retrieval-
Augmented Factuality Scorer (RAFS) evaluates
reasoning candidates for a medical question. The
example involves diagnosing and treating a patient
presenting with symptoms consistent with seasonal
allergic conjunctivitis. RAFS assigns factuality
scores to each candidate reasoning path based on
their alignment with retrieved evidence.
Candidate Reasoning 1 accurately identifies
the condition and treatment, correctly selecting
ketotifen eye drops (Answer B) with a factuality
score of 1.0. Candidate Reasoning 2 suggests flu-
orometholone eye drops (Answer D) but includes
conflicting reasoning and inaccuracies, resulting
in a lower factuality score of 0.625. Candidate
Reasoning 3 incorrectly recommends warm com-
presses (Answer C) as the most appropriate treat-
ment, reflecting limited factual alignment and re-
ceiving a score of 0.6.
This example highlights RAFSs ability to differ-
entiate between reasoning paths based on factual
correctness, ensuring that the most reliable and
evidence-supported answer is prioritized.
A.7 Common Trajectories Leading to Correct
Answers
Figures 6 and 7 illustrate the top 10 most common
reasoning trajectories that lead to correct answers
on MedQA and StrategyQA, respectively. Each
trajectory represents a sequence of actions selected
by the Retrieval-Augmented Generator during the
reasoning process.
In Figure 6 (MedQA), trajectories like A1 →
A2, A3 → A2, and A1 → A6 are prominent, ac-
counting for a significant portion of successful rea-
soning paths. Notably, more complex trajectories
such as A3 → A7 → A3 also contribute, show-
casing the generators ability to adaptively explore
diverse paths.
Figure 7 (StrategyQA) reveals a similar distri-
bution, with trajectories like A1 → A2, A3 →
A2, and A1 → A6 remaining dominant. How-
ever, simpler actions like A6 and A2 also play a
notable role in this task, reflecting differences in
task complexity and reasoning requirements.
Both figures highlight the flexibility of RAREs
generator, which leverages a rich action space to
explore diverse reasoning strategies. The distribu-
tion of trajectories emphasizes the importance of
both simple and complex reasoning paths in solv-
ing different types of tasks effectively.
A.8 Prompt of Different Actions in MCTS
RAFS Examples
Question: A 35-year-old man comes to the physician because of itchy, watery eyes for the past
week. He has also been sneezing multiple times a day during this period. He had a similar
episode 1 year ago around springtime. He has iron deficiency anemia and ankylosing spondylitis.
Current medications include ferrous sulfate, artificial tear drops, and indomethacin. He works as an
elementary school teacher. His vital signs are within normal limits. Visual acuity is 20/20 without
correction. Physical examination shows bilateral conjunctival injection with watery discharge.
The pupils are 3 mm, equal, and reactive to light. Examination of the anterior chamber of the eye
is unremarkable. Which of the following is the most appropriate treatment? A: Erythromycin
ointment, B: Ketotifen eye drops, C:Warm compresses, D: Fluorometholone eye drops
Candidate Reasoning 1: Lets think step by step. Based on the symptoms described - itchy, watery
eyes, sneezing, bilateral conjunctival injection, and watery discharge - along with the history of a
similar episode around springtime, its clear that the patient is experiencing allergic conjunctivitis,
likely triggered by seasonal allergens like pollen given his profession as an elementary school
teacher. For symptomatic relief of allergic conjunctivitis, antihistamine eyedrops or mast cell
stabilizers can be effective. Among the options provided, ketotifen eye drops act as a mast cell
stabilizer and would be appropriate for treating allergic conjunctivitis. The answer is B: Ketotifen
eye drops. ✓ The factuality score is 1.0
Candidate Reasoning 2: Based on the patients symptoms of itchy, watery eyes, sneezing, and
physical examination findings of bilateral conjunctival injection with watery discharge, the diagno-
sis is allergic conjunctivitis. Considering the timing of the episode and the patients profession,
the most likely causative agent is seasonal pollen. Treatment should focus on reducing symptoms
rather than eliminating the allergen source. Fluorometholone eye drops are corticosteroid drops
that reduce inflammation and can provide relief from itching and redness. Other options like
erythromycin or ketotifen may have some effect but would be less effective in addressing this
presentation. Warm compresses might help with discharge, but again, would be less effective
compared to the impact of corticosteroids. Therefore, the most appropriate treatment is fluo-
rometholone eye drops. The answer is D: Fluorometholone eye drops. ×The factuality score is
0.625
Candiate Reasoning 3: Given the patients symptoms of itchy, watery eyes, sneezing, and
conjunctival injection, along with a history of similar episodes around springtime, this case is most
consistent with seasonal allergic conjunctivitis. The best treatment for mild allergic conjunctivitis
involves avoiding triggers when possible, using lubricating artificial tears regularly, and applying
a cold compress. Warm compresses are often recommended to help loosen crusts and debris,
improving comfort. Therefore, warm compresses would be the most appropriate treatment for this
patient. The answer is C: Warm compresses. ×The factuality score is 0.6
Figure 5: Evaluation of reasoning candidates by the Retrieval-Augmented Factuality Scorer (RAFS). Each candidate
provides a reasoning path for a given question, with RAFS assigning a factuality score based on alignment with
retrieved evidence.
Figure 6: Top 10 common trajectories that lead to correct answer (MedQA)
Figure 7: Top 10 common trajectories that lead to correct answer (StrategyQA)
Multi-step reasoning in Medical QA
Question: A 23-year-old pregnant woman at 22 weeks gestation presents with burning upon
urination. She states it started 1 day ago and has been worsening despite drinking more water and
taking cranberry extract. She otherwise feels well and is followed by a doctor for her pregnancy.
Her temperature is 97.7°F (36.5°C), blood pressure is 122/77 mmHg, pulse is 80/min, respirations
are 19/min, and oxygen saturation is 98% on room air. Physical exam is notable for an absence of
costovertebral angle tenderness and a gravid uterus. Which of the following is the best treatment
for this patient? A: Ampicillin, B: Ceftriaxone, C:Ciprofloxacin, D: Doxycycline, E: Nitrofurantoin
Step 1: Identify key clinical features A 23-year-old pregnant woman at 22 weeks gestation
presents with burning upon urination (dysuria), worsening symptoms over one day, and no systemic
signs of infection (normal temperature, blood pressure, and oxygen saturation). Physical exam
shows no costoverterbral angle tenderness, suggesting the absence of pyelonephritis.
Step 2: Determine the likely diagnosis Dysuria without systemic signs in a pregnant woman is
most consistent with acute cystitis, a lower urinary tract infection.
Step 3: Evaluate treatment options for cystitis in pregnancy Nitrofurantoin: Safe and effective
during the second trimester, commonly used for uncomplicated cystitis. Ampicillin: Can be used
but has high resistance rates among common uropathogens like E. coli. Ceftriaxone: Typically
used for severe infections like pyelonephritis and administered intravenously, not necessary here.
Ciprofloxacin: A fluoroquinolone, contraindicated in pregnancy due to potential cartilage damage
to the fetus. Doxycycline: A tetracycline, contraindicated in pregnancy due to risks of fetal bone
growth inhibition and teeth discoloration.
Step 4: Select the best treatment Nitrofurantoin is the safest and most effective option for this
patient in the second trimester.
Step 5: Conclusion The best treatment for this patient is nitrofurantoin. The answer is E:
Nitrofurantoin.
Figure 8: An example of a medical question that requires multi-step reasoning to answer.
Action 1. Propose an one-step thought.
### Instruction: A 46-year-old woman comes to the physician because of a 2-week history
of diplopia and ocular pain when reading the newspaper. She also has a 3-month history of
amenorrhea, hot flashes, and increased sweating. She reports that she has been overweight all her
adult life and is happy to have lost 6.8 kg (15 lb) of weight in the past 2 months. Her pulse is
110/min, and blood pressure is 148/98 mm Hg. Physical examination shows moist palms and a
nontender thyroid gland that is enlarged to two times its normal size. Ophthalmologic examination
shows prominence of the globes of the eyes, bilateral lid retraction, conjunctival injection, and an
inability to converge the eyes. There is no pain on movement of the extraocular muscles. Visual
acuity is 20/20 bilaterally. Neurologic examination shows a fine resting tremor of the hands. Deep
tendon reflexes are 3+ with a shortened relaxation phase. Which of the following is the most
likely cause of this patients ocular complaints? A: Granulomatous inflammation of the cavernous
sinus, B: Abnormal communication between the cavernous sinus and the internal carotid artery,
C: Glycosaminoglycan accumulation in the orbit, D: Bacterial infection of the orbital contents, E:
Sympathetic hyperactivity of levator palpebrae superioris
### Response: Lets think step by step.
Step 1: Identify key clinical features: A 46-year-old woman presents with diplopia, ocular pain,
weight loss, amenorrhea, and hyperthyroid signs like tachycardia, enlarged thyroid gland, and
hyperreflexia.
Step 2: Recognize underlying condition: These findings suggest Graves disease with thyroid-
associated orbitopathy (TAO).
Step 3: Determine cause of ocular symptoms: Prominent globes, lid retraction, and conjunctival
injection are caused by immune-mediated glycosaminoglycan accumulation in the orbit, character-
istic of TAO.
Step 4: Eliminate other options: Conditions like cavernous sinus inflammation, carotid-cavernous
fistula, and bacterial infection do not fit the patients presentation.
Step 5: The most likely cause of the ocular complaints is glycosaminoglycan accumulation in the
orbit.
Step 6: Conclusion: The answer is C: Glycosaminoglycan accumulation in the orbit.
### Instruction: {user question}
### Response: Lets think step by step.
Action 2: Propose the remaining thought steps /A4: Answer the sub-question again.
### Instruction: A 1-year-old boy presents to the emergency department with weakness and
a change in his behavior. His parents state that they first noticed the change in his behavior
this morning and it has been getting worse. They noticed the patient was initially weak in his
upper body and arms, but now he wont move his legs with as much strength or vigor as he
used to. Physical exam is notable for bilateral ptosis with a sluggish pupillary response, a very
weak sucking and gag reflex, and shallow respirations. The patient is currently drooling and his
diaper is dry. The parents state he has not had a bowel movement in over 1 day. Which of the
following is the pathophysiology of this patients condition? A: Antibodies against postsynaptic
nicotinic cholinergic ion channels, B: Autoantibodies against the presynaptic voltage-gated
calcium channels, C: Autoimmune demyelination of peripheral nerves, D: Blockade of presynaptic
acetylcholine release at the neuromuscular junction, E: Lower motor neuron destruction in the
anterior horn
### Response: Lets think step by step. The infant has rapidly progressing weakness starting
from the upper body and moving downward, bilateral ptosis, sluggish pupils, weak sucking and
gag reflexes, shallow respirations, drooling, constipation (dry diaper and no bowel movement),
and decreased muscle strength. These symptoms are consistent with infant botulism, caused
by ingestion of Clostridium botulinum spores (often from honey) that produce botulinum toxin.
The toxin inhibits the release of acetylcholine at the presynaptic terminals of the neuromuscular
junction by cleaving SNARE proteins necessary for vesicle fusion. This blockade leads to flaccid
paralysis and autonomic dysfunction. Therefore, the pathophysiology is blockade of presynaptic
acetylcholine release at the neuromuscular junction. The answer is D: Blockade of presynaptic
acetylcholine release at the neuromuscular junction.
### Instruction: {user question}
### Response:
Action 3: Propose next sub-question along with its answer.
Given a question, please decompose it into sub-questions. For each sub-question, please answer it
in a complete sentence, ending with "The answer is ". When the original question is answerable,
please start the subquestion with "Now we can answer the question: <original question>".
Question 1: A 23-year-old pregnant woman at 22 weeks gestation presents with burning upon
urination. She states it started 1 day ago and has been worsening despite drinking more water and
taking cranberry extract. She otherwise feels well and is followed by a doctor for her pregnancy.
Her temperature is 97.7°F (36.5°C), blood pressure is 122/77 mmHg, pulse is 80/min, respirations
are 19/min, and oxygen saturation is 98% on room air. Physical exam is notable for an absence
of costovertebral angle tenderness and a gravid uterus. Which of the following is the best
treatment for this patient? A: Ampicillin, B: Ceftriaxone, C: Ciprofloxacin, D: Doxycycline, E:
Nitrofurantoin
Question 1.1: What is the most likely diagnosis for this patient?
Answer 1.1: The patient is a 23-year-old pregnant woman at 22 weeks gestation presenting
with burning upon urination, known as dysuria. She has no fever, normal vital signs, and no
costovertebral angle tenderness. This suggests that she is experiencing an acute uncomplicated
urinary tract infection (UTI), specifically cystitis.
Question 1.2: Which antibiotics are safe and effective for treating cystitis during pregnancy?
Answer 1.2: During pregnancy, certain antibiotics are preferred due to their safety profiles for both
the mother and the fetus. Nitrofurantoin is commonly used and considered safe during the second
trimester for treating cystitis. Ampicillin may be less effective due to resistance. Ceftriaxone is
typically reserved for more severe infections like pyelonephritis and is administered intravenously.
Ciprofloxacin and doxycycline are contraindicated in pregnancy because they can harm fetal
development.
Question 1.3: Now we can answer the question: Which of the following is the best treatment for
this patient?
Answer 1.3: The best treatment for this pregnant patient with acute cystitis is Nitrofurantoin, as it
is safe during the second trimester and effective against common urinary pathogens. Therefore, the
answer is E: Nitrofurantoin.
Question 2: {user question}
Action 5: Rephrase the question/sub-question.
You are an AI assistant to help me rephrase questions by splitting the question context into
conditions. In your rephrased question, remember to fully express the information in the original
question.
Original Question: A 62-year-old woman comes to the physician because of coughing and fatigue
during the past 2 years. In the morning, the cough is productive of white phlegm. She becomes
short of breath walking up a flight of stairs. She has hypertension and hyperlipidemia. She has
recently retired from working as a nurse at a homeless shelter. She has smoked 1 pack of cigarettes
daily for 40 years. Current medications include ramipril and fenofibrate. Her temperature is
36.5°C (97.7°F), respirations are 24/min, pulse is 85/min, and blood pressure is 140/90 mm Hg.
Scattered wheezing and rhonchi are heard throughout both lung fields. There are no murmurs, rubs,
or gallops but heart sounds are distant. Which of the following is the most likely underlying cause
of this patients symptoms? A: Chronic decrease in pulmonary compliance, B: Local accumulation
of kinins, C: Mycobacterial invasion of pulmonary parenchyma, D: Progressive obstruction of
expiratory airflow, E: Incremental loss of functional residual capacity
Rephrased Question: A 62-year-old woman comes to the physician due to a 2-year history of
coughing and fatigue. She has a morning cough productive of white phlegm and becomes short of
breath when climbing stairs. She has hypertension and hyperlipidemia and recently retired from
nursing at a homeless shelter. She has a 40-pack-year smoking history. Her medications include
ramipril and fenofibrate. Vital signs are temperature 36.5°C (97.7°F), respirations 24/min, pulse
85/min, and blood pressure 140/90 mmHg. Physical examination reveals scattered wheezing and
rhonchi throughout both lung fields. Heart sounds are distant with no murmurs, rubs, or gallops.
Which of the following is the most likely underlying cause of this patients symptoms? A: Chronic
decrease in pulmonary compliance, B: Local accumulation of kinins, C: Mycobacterial invasion of
pulmonary parenchyma, D: Progressive obstruction of expiratory airflow, E: Incremental loss of
functional residual capacity
Original question: {user question}
Rephrased Question:
Action 6: Generate multiple search queries and retrieve information.
Given a question, generate a search query that would help gather information to answer it. Your
goal is to formulate a query that will retrieve useful evidence or additional details that contribute to
answering the question. The query should aim to obtain new information and be specific enough
to ensure that the search results are relevant and helpful.
Question 1: A 23-year-old pregnant woman at 22 weeks gestation presents with burning upon
urination. She states it started 1 day ago and has been worsening despite drinking more water and
taking cranberry extract. She otherwise feels well and is followed by a doctor for her pregnancy.
Her temperature is 97.7°F (36.5°C), blood pressure is 122/77 mmHg, pulse is 80/min, respirations
are 19/min, and oxygen saturation is 98% on room air. Physical exam is notable for an absence
of costovertebral angle tenderness and a gravid uterus. Which of the following is the best
treatment for this patient? A: Ampicillin, B: Ceftriaxone, C: Ciprofloxacin, D: Doxycycline, E:
Nitrofurantoin
Query 1.1: Common causes and management of dysuria in pregnant women without systemic
symptoms.
Document 1.1: Dysuria in pregnant women without systemic symptoms like fever or flank pain
is often indicative of acute cystitis, a lower urinary tract infection typically caused by bacteria
such as Escherichia coli. Pregnancy increases the risk of urinary tract infections due to hormonal
changes that relax ureteral smooth muscle and mechanical compression from the enlarging uterus,
leading to urinary stasis. Management involves confirming the diagnosis with a urine culture and
initiating antibiotic therapy that is safe for use during pregnancy.
Query 1.2: Antibiotics that are safe and effective for treating cystitis during pregnancy.
Document 1.2: Safe and effective antibiotics for treating cystitis in pregnancy include nitro-
furantoin and certain beta-lactam antibiotics like ampicillin and cephalexin. Nitrofurantoin is
commonly used during the second trimester and is effective against common urinary pathogens.
Ampicillin can be used but may have increased resistance rates. Ceftriaxone is a third-generation
cephalosporin administered intravenously and is typically reserved for more severe infections
like pyelonephritis. Antibiotics such as doxycycline (a tetracycline) and ciprofloxacin (a
fluoroquinolone) are contraindicated in pregnancy due to potential risks to fetal development.
Query 1.3: Antibiotics contraindicated during pregnancy and their associated risks.
Document 1.3: Certain antibiotics are contraindicated during pregnancy due to teratogenic effects
or adverse outcomes for the fetus. Doxycycline, a tetracycline antibiotic, is contraindicated
because it can inhibit bone growth and cause permanent tooth discoloration in the developing fetus.
Ciprofloxacin, a fluoroquinolone, is avoided as it has been associated with cartilage damage in
animal studies and potential musculoskeletal risks in humans. These medications should not be
used to treat infections in pregnant patients.
Question 2: {user question}
Action 7: Re-answer the question/sub-question with retrieved information.
### Instruction: A 1-year-old boy presents to the emergency department with weakness and
a change in his behavior. His parents state that they first noticed the change in his behavior
this morning and it has been getting worse. They noticed the patient was initially weak in his
upper body and arms, but now he wont move his legs with as much strength or vigor as he
used to. Physical exam is notable for bilateral ptosis with a sluggish pupillary response, a very
weak sucking and gag reflex, and shallow respirations. The patient is currently drooling and his
diaper is dry. The parents state he has not had a bowel movement in over 1 day. Which of the
following is the pathophysiology of this patients condition? A: Antibodies against postsynaptic
nicotinic cholinergic ion channels, B: Autoantibodies against the presynaptic voltage-gated
calcium channels, C: Autoimmune demyelination of peripheral nerves, D: Blockade of presynaptic
acetylcholine release at the neuromuscular junction, E: Lower motor neuron destruction in the
anterior horn
### Relevant Documents:
Infant Botulism: Caused by ingestion of Clostridium botulinum spores (common sources include
honey and soil). Spores germinate in the infants gut, producing botulinum toxin.
Botulinum Toxin Mechanism: Blocks the release of acetylcholine at presynaptic neuromuscular
junctions by cleaving SNARE proteins. Results in flaccid paralysis and autonomic dysfunction.
Clinical Features: Symmetric descending paralysis starting with cranial nerves (ptosis, poor suck,
weak gag reflex).
Autonomic symptoms: constipation, dry mouth, drooling. Hypotonia and respiratory difficulties.
### Response: Lets think step by step. The infant presents with rapidly progressing weakness
starting in the upper body and moving downward, bilateral ptosis with sluggish pupillary response,
weak sucking and gag reflexes, shallow respirations, drooling, and constipation (dry diaper, no
bowel movement). These symptoms are characteristic of infant botulism, caused by ingestion
of Clostridium botulinum spores that produce botulinum toxin. The toxin inhibits the release of
acetylcholine at the presynaptic terminals of the neuromuscular junction by cleaving SNARE
proteins necessary for neurotransmitter release. This blockade leads to flaccid paralysis and
autonomic dysfunction. Therefore, the pathophysiology is blockade of presynaptic acetylcholine
release at the neuromuscular junction. The answer is D: Blockade of presynaptic acetylcholine
release at the neuromuscular junction.
### Instruction: {user question}
### Relevant Documents: {relevant documents}
### Response:`;
export default mockContentString;