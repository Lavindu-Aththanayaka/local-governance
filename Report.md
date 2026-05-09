

Framework for Blockchain-Based
Community-Assisted Privacy- Preserving
Reporting Service for Local Governance
An undergraduate project progress report submitted to the
Department of Electrical and Information Engineering
Faculty of Engineering
University of Ruhuna
## Sri Lanka
in partial fulfillment of the requirements for the
Degree of the Bachelor of the Science of Engineering
## Honours
by
## K.A.L.G. ATHTHANAYAKA    -    EG/2021/4419
## J.S. KARUNARATHNA-    EG/2021/4599
## A.D.H. KARUNATHILAKE-    EG/2021/4604
## P.A.M.J.A. PATHIRAJA-    EG/2021/4703
## ..............................................
## Dr.  Subodha Gunawardena
(Supervisor)

## Abstract
Local governments in developing countries often struggle to address public issues
efficiently.   These  struggles  are  mainly  due  to  limited  transparency,  centralized
data management, and insufficient citizen participation.  E-governance and crowd-
sourced reporting systems are designed to enhance public engagement.  But their
effectiveness is limited by issues related to data integrity, user anonymity, content
reliability, and trustworthiness.As a solution to the above challenges, we propose
a blockchain-based,  community-assisted,  privacy-preserving reporting framework
for local governance.  The main objective of the project is to design and proto-
type a permissioned blockchain-based reporting system.  This system will enable
citizens  to  anonymously  submit  public  issue  reports  and  participate  in  opinion
polling.   Also,  our  system  will  ensure  data  immutability  and  transparency.   To
manage  reporting  workflows,  issue  tracking,  and  community  voting  in  a  secure
and  tamper-resistant  manner,  the  blockchain  will  use  Proof-of-Authority  (PoA)
mechanism and smart contracts.  User identity is decoupled from the report con-
tent using a simulated identity and an access control mechanism to preserve the
privacy of the users.  Large data objects, such as images, are stored off-chain with
cryptographic hashes anchored on the blockchain.  Additionally, an Artificial Intel-
ligence (AI)-assisted content moderation mechanism will be used to minimize the
impact of malicious, low-quality reporting content.  To demonstrate the feasibility
of the proposed framework, A web-based Decentralized App (DApp) is developed
as a proof of concept within a controlled experimental environment.  Through this
project, we aim to deliver a practical and scalable prototype that enhances citizen
participation, accountability, and trust in local governance systems.
i

## Acknowledgments
We would like to express our sincere gratitude to our project supervisor, Dr.  Sub-
odha Gunawardena, for his guidance, support, and valuable feedback throughout
the progress of this project.  His advice helped us improve the direction,  scope,
and technical quality of our work.
We are also thankful to the Department of Electrical and Information Engineering,
Faculty of Engineering, University of Ruhuna, for providing us the opportunity to
carry  out  this  undergraduate  project  and  for  giving  us  the  necessary  academic
guidance.
We would like to thank the module coordinator and evaluation panel for their in-
structions, comments, and suggestions during the project evaluation stages.  Their
feedback helped us refine the project structure, methodology, and implementation
plan.
Finally,  we  would  like  to  appreciate  the  support  given  by  our  batchmates  and
colleagues through discussions, technical suggestions, and encouragement.  Their
ideas  helped  us  identify  practical  issues  and  improve  our  understanding  of  the
system.
K.A.L.G. Aththanayaka    -    EG/2021/4419
J.S. Karunarathna-    EG/2021/4599
A.D.H. Karunathilake-    EG/2021/4604
P.A.M.J.A. Pathiraja-    EG/2021/4703
ii

## Contents
## Abstracti
## Acknowledgementsii
## Contentsv
List of Figuresvi
List of Tablesvii
## Acronymsviii
## 1   Introduction1
1.1    Problem Background  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .1
1.2    Problem Statement  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .2
1.3    Objectives and Scope  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .3
1.3.1Aim   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .3
1.3.2Objectives  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .3
1.3.3Scope    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .3
1.4    Literature Review .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .4
1.4.1Digital Citizen Reporting and e-Governance Systems   .  .  .  .4
1.4.2Blockchain for Local Governance Applications  .  .  .  .  .  .  .  .5
1.4.3Blockchain-Based  Citizen  Reporting  and  Complaint  Man-
agement Systems   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .5
1.4.4Permissioned Blockchains and PoA Consensus Mechanisms  .7
1.4.5Smart Contracts for Public Issue Management and Opinion
Polling  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .8
1.4.6User Interfaces for Blockchain-Based e-Governance Applica-
tions  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .9
1.4.7AI-Based Content Moderation in Civic Reporting   .  .  .  .  .  .   11
1.4.8Need for Automated Content Moderation .  .  .  .  .  .  .  .  .  .  .   11
1.4.9Architectural Approaches for AI Blockchain Integration .  .  .   11
iii

1.4.10  AI Oracles and Decentralized Oracle Networks  .  .  .  .  .  .  .  .   12
1.5    Report Outline   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   13
## 2   Background15
2.1    Blockchain Technology  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   15
2.2    Permissioned Blockchain and PoA .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   15
2.3    Smart Contracts    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   16
2.4    Decentralized Applications (DApps) .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   16
2.5    InterPlanetary File System (IPFS)   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   17
2.6    Zero-Knowledge and Identity Concepts  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   18
2.7    AI-based Content Moderation  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   18
3   Methodology and Implementation19
3.1    Methodology    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   19
3.1.1Research Methodology  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   19
3.1.2System Requirements Analysis .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   20
3.1.3Proposed System Architecture  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   21
3.1.4Proposed Workflow  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   23
3.1.5Project Plan and Timeline  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   29
3.1.6Expected Outcomes .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   37
3.2    Implementation  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   39
3.2.1Permissioned Blockchain Implementation  .  .  .  .  .  .  .  .  .  .  .   39
3.2.2Smart Contract Architecture and Logic  .  .  .  .  .  .  .  .  .  .  .  .   39
3.2.3Identity and Access Control Implementation  .  .  .  .  .  .  .  .  .   42
3.2.4Backend Relayer Implementation   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   43
3.2.5IPFS Off-chain Storage Integration   .  .  .  .  .  .  .  .  .  .  .  .  .  .   44
3.2.6AI-based Moderation System Implementation   .  .  .  .  .  .  .  .   45
3.2.7Web-based DApp Development   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   47
4   Testing, Experimentation, and Validation49
4.1    Experimental Setup .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   49
4.1.1Hardware Infrastructure   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   49
4.1.2Software and Deployment Environment  .  .  .  .  .  .  .  .  .  .  .  .   50
4.1.3Blockchain Configuration (Server 1) .  .  .  .  .  .  .  .  .  .  .  .  .  .   50
4.1.4Application and Services Topology   .  .  .  .  .  .  .  .  .  .  .  .  .  .   50
4.2    Testing Methodology  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   51
4.2.1Subsystem Testing   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   51
4.2.2Integration Testing  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   52
4.2.3Functional Testing   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   52
4.2.4Blockchain Performance Testing  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   53
4.2.5Smart Contract Validation  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   55
iv

4.3    AI Moderation Testing  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   57
4.3.1API Availability Test  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   58
4.3.2Moderation Classification Tests   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   58
4.3.3Oracle Voting Validation  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   58
4.3.4Response Structure Validation  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   59
4.4    IPFS Storage Testing  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   60
4.5    End-to-End Integration Testing   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   61
4.6    Comparison with Existing Systems   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   66
4.6.1Centralized Reporting Platforms .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   66
4.6.2Traditional Content Moderation  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   66
4.6.3Public Blockchain Approaches  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   67
4.6.4Domain-Specific Blockchain Solutions  .  .  .  .  .  .  .  .  .  .  .  .  .   67
## 5   Discussion68
5.1    Novel Contributions of the Project   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   68
5.2    Overall System Validity    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   68
5.3    Achievement of Proposed Objectives   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   69
5.4    Summary of Results and Observations   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   69
5.5    Real-world Applicability   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   70
5.6    Limitations of the Current Prototype  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   70
6   Conclusion and Future Work71
6.1    Conclusion .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   71
6.2    Future Work .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   71
6.3    Final Remarks .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   72
## Bibliography73
v

List of Figures
1.1    System Architecture of the Police Complaint Management System.[1]    6
3.1    High Level Architecture Diagram.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   22
3.2    Citizen Authentication and Identity Workflow   .  .  .  .  .  .  .  .  .  .  .  .   25
3.3    Overall lifecycle workflow of a civic issue within the decentralized
framework. .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   32
3.4    Report Submission Workflow .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   33
3.5    Community Validation Workflow   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   34
3.6    Authority Resolution and Action Workflow .  .  .  .  .  .  .  .  .  .  .  .  .  .   35
3.7    Post-Resolution Verification and Appeal Workflow .  .  .  .  .  .  .  .  .  .   36
3.8    Project Timeline Gantt Chart  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   38
3.9    State transition diagram for the civic reporting system.  .  .  .  .  .  .  .   41
3.10  Backend relayer workflow architecture.   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   43
3.11  Oracle network architecture for AI moderation.   .  .  .  .  .  .  .  .  .  .  .   46
4.1    Citizen Authentication Interfaces   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   62
4.2    Report Submission Form  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   63
4.3    Views of the Submitted Report in the Community Feed  .  .  .  .  .  .  .   65
vi

List of Tables
3.1    Project plan and current progress  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   30
4.1    AI moderation API availability tests   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   58
4.2    AI moderation classification tests   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   59
4.3    Oracle voting validation   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   59
4.4    Oracle aggregator response fields    .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .   59
vii

## Acronyms
AI-    Artificial Intelligence
API-    Application Programming Interface
CID-    Content Identifier
CI/CD    -    Continuous Integration and Continuous Deployment
CNN-    Convolutional Neural Network
DApp-    Decentralized Application
FSM-    Finite State Machine
IPFS-    InterPlanetary File System
KPI-    Key Performance Indicator
NGO-    Non-Governmental Organization
NLP-    Natural Language Processing
PaaS-    Platform-as-a-Service
PII-    Personally Identifiable Information
PoA-    Proof of Authority
PoS-    Proof of Stake
PoW-    Proof of Work
RBAC-    Role-Based Access Control
RPC-    Remote Procedure Call
TPS-    Transactions Per Second
VPS-    Virtual Private Server
ZKP-    Zero-Knowledge Proof
viii

## 1
## Chapter 1
## Introduction
Local governance is fundamental to the upkeep of public infrastructure and the
overall well-being of the community.  To address public problems such as damaged
roads, issues in waste management, street light failures, effective communication
between citizens and local authorities is  critical.  Recently,  the integration  of e-
governance systems and crowdsourcing has improve the citizen participation and
streamline the reporting and resolution of public issues.
However, most of the current systems rely on centralized architectures.  This poses
a  challenge  in  dealing  with  data  integrity,  transparency,  and  user  privacy.   Cit-
izens are reluctant to provide complaints about sensitive topics or criticism due
to potential retaliation or the possibility of their personal info being abused.  At
the same time, the local government is faced with the challenge of verifying the
authenticity of anonymous complaints raised by citizens.
Some of the key features of Blockchain technology are immutability, transparency,
and decentralization.  Those features can be used to address several limitations of
conventional reporting systems.  It is possible to design reporting platforms that
protect user anonymity while ensuring the integrity and accountability of reported
information by combining blockchain-based architectures and privacy-preserving
mechanisms.  This project examines the application of blockchain technology in
developing a secure, community-driven reporting framework tailored to local gov-
ernance contexts.
## 1.1    Problem Background
In the context of local governance, crowdsourced reporting systems and e-governance
platforms are widely adopted.  By using those systems, citizens can report issues,
provide feedback and participate in decision making.  It improves the inclusiveness
and  the  accountability  of  every  citizen.   In  developing  countries  like  Sri  Lanka,
these systems have the potential to significantly improve the governance efficiency.

## 2
Timely identification and the resolution of public conccerns are the key to gover-
nance efficiency.
However,  despite  their  advantages,  the  conventional  e-governance  and  reporting
systems  are  still  highly  centralized,  making  them  prone  to  various  threats  such
as  data  tampering,  illegal  access,  and  single  points  of  failure.   In  addition,  the
ability to track behavior down to individual users could serve as a discouraging
factor, particularly in reporting delicate matters, in a system that lacks anonymity.
Blockchain-based systems have appeared as a feasible solution for managing shared
data  in  a  tamper-proof  and  transparent  manner.   The  ability  of  permissioned
blockchains  to  enable  controlled  participation  while  maintaining  accountability
through trusted validators makes them a desirable choice for governance applica-
tions.  By using smart contracts, reporting workflows and opinion polling can be
automated rather than relying on centralized intermediaries.
While blockchain technology offers data integrity and transparency, it still poses
challenges related to user privacy, content moderation, and trustworthiness among
anonymous participants.  These challenges remain open research and implementa-
tion problems. Combining blockchain with privacy-preserving identity mechanisms
and AI-assisted moderation can help address these limitations and supports the
need  for  a  comprehensive  framework  for  secure  and  reliable  community-assisted
reporting.
## 1.2    Problem Statement
The existing frameworks of e-governance and crowdsourced reporting systems for
local governance do not provide an integrated mechanism that can guarantee data
integrity, user anonymity, and trustworthiness of citizen submitted reports.  Cen-
tralized architectures are prone to unauthorized access, data tampering, and loss
of transparency.  At the same time, identity dependent systems discourage citizen
engagement due to privacy concerns and fear of retaliation.
Although  blockchain  has  been  applied  to  the  context  of  local  government  con-
text, many blockchain-based reporting systems still fail to balance anonymity with
mechanisms for assessing the reliability and quality of submitted reports.  Further-
more,  the  lack  of  content  moderation  and  trust  evaluation  increases  the  risk  of
misinformation, and malicious or low quality submissions.
Therefore, there is a clear need for a privacy-preserving, blockchain-based reporting
framework that enables anonymous citizen participation while ensuring data im-
mutability, transparent workflows, and reliable evaluation of reported information.
This project aims to address this gap by designing and prototyping a permissioned
blockchain-based  community-assisted  reporting  system  that  incorporates  smart
contracts, off-chain data storage, and AI-assisted content moderation mechanism

## 3
suitable for local governance environments.
1.3    Objectives and Scope
## 1.3.1    Aim
The aim of this project is to design and prototype a blockchain-based,  privacy-
preserving,  community-assisted  reporting  system  for  local  governance  that  em-
powers citizens to report public issues and provide their opinions in a transparent,
accountable, and secure manner.
## 1.3.2    Objectives
-  Design  and  implement  a  permissioned  reporting  blockchain  using  a  PoA
consensus  mechanism  to  ensure  the  integrity  and  immutability  of  citizen-
submitted reports.
-  Design and deploy smart contracts to automate public issue reporting work-
flows, including ticket creation, issue resolution and closure, community vot-
ing as feedback on resolved issues, and separate opinion polling mechanisms
for public consultation.
-  Develop user-friendly interfaces that enable citizens and authorized govern-
ment officials to interact with the blockchain for reporting issues and tracking
their resolution status.
-  Design and integrate an AI-based content moderation system to detect and
filter inappropriate textual and visual content in user-submitted reports.
## 1.3.3    Scope
-  A prototype of the proposed blockchain will be implemented with a minimum
of three full nodes.  The PoA consensus mechanism will be used to enable
efficient and controlled transaction validation within a permissioned network,
while excluding deployment of public, permissionless blockchains or globally
distributed ledger infrastructures.
-  User authentication and identity decoupling are managed through a simu-
lated identity service, and the design and implementation of a fully decen-
tralized Self-Sovereign Identity (SSI) blockchain are explicitly excluded from
the scope of this project.

## 4
-  The  integration  of  AI  within  the  system  is  limited  to  content  moderation
using  existing  machine  learning  models,  libraries,  or  external  Application
Programming Interfaces (Application Programming Interface (API)s),  and
the development of custom, from-scratch deep learning architectures is not
within the scope of this work.
-  Transaction validation authority within the blockchain network is restricted
to  pre-approved  institutional  stakeholders,  including  local  government  en-
tities and recognized non-governmental organizations, and does not permit
anonymous  public  participation  or  Proof-of-Work  (Proof-of-Work  (PoW))
based mining.
-  The project emphasizes functional validation, system evaluation, and perfor-
mance analysis within a controlled experimental environment, and does not
address real-world legal compliance, regulatory adoption, legislative reform,
or large-scale integration with existing national government information sys-
tems.
-  The user interface development is limited to a responsive, web-based DApp
accessible via standard mobile and desktop web browsers, and explicitly ex-
cludes  the  development  of  native  mobile  applications  (iOS  or  Android)  or
cross-platform native frameworks.
## 1.4    Literature Review
1.4.1    Digital Citizen Reporting and e-Governance Systems
Electronic governance (e-governance) is using the information and communication
technologies to provide government services.  This includes the support of govern-
ment to citizens (G2C), government to business (G2B) , government to agencies
(G2A) etc.  By utilizing the e-governance platforms, everyone can gain access to
whole range of public services.  Additionally citizens can submit complaints and
participate in governance decision making process.  [2].
Digital  citizen  reporting  system  is  one  of  the  many  use  case  of  e-governance.
”FixMyStreet” is a a such existing platform.  It enable citizens to report issues for
different issue categories.  Sanitation, Traffic and Public Safety are some examples.
Previous studies shows that these kind of systems improve governance administra-
tive efficiency, civic participation and also they increase the transparency.[3].
Even though there are many benefits of digital citizen reporting in local governance
as described earlier, most of them still use centralized server based architecture.
This centralized approach have its own limitations and disadvantages.  Suscepti-
bility to data tempering, lack of transparency are the main problems that impact

## 5
heavily on public trust.  In addition to that, mandatory identity disclosure is dis-
couraging public participation on this kind of reporting systems.  Therefore these
problems motivate the findings of new decentralized, transparent and immutable
architectures that still preserve user privacy with accountability.
1.4.2    Blockchain for Local Governance Applications
Blockchain  is  a  technology  that  has  been  popular  for  its  ability  to  have  an  im-
mutable, transparent and decentralized ledger for public data.  Hence, its a trans-
formative tool for e-governance to address the problems that existing implemen-
tations had.  The Blockchain allow us to verify the immutability of the records, so
its suitable for governance applications where the trust and the accountability is
crucial.  [4], [5].
Blockchain based land registry system implemented in Cook Country, Illinois is a
one real world example of the applicability of blockchain in local governance.  They
aim to reduce the property fraud by consolidating historical ownership records into
a verifiable block in the blockchain.  Similar to that Delaware has taken initiative
to explore the use of smart contracts that’s enable real time asset tracking and
automate business fillings. This improves the regulatory compliance and oversights
## [5].
In  addition  to  administrative  efficiency,  blockchain  has  been  utilized  for  citizen
centric services, such as secure digital identity management.  Estonia has taken a
initiative to integrate blockchain across healthcare, taxation and even electronic
voting  systems.   So  this  can  provide  a  mathematically  verifiable  audit  trail  for
government data.  MyPass project in Austin and the World Food Program’s build-
ing  blocks  initiative  also  use  Blockchain  technology  under  the  hood  to  manage
encrypted identity and transaction records [4].
Despite the advancements in the blockchain base applications, existing literature
highlights the challenges of adoption in governance.  Scalability constraints,  pri-
vacy concerns related to identity data, performance overhead and also the need of
the legislative and institutional reforms are some examples.  These factors needs to
be addressed by carefully selecting blockchain architectures and consensus mech-
anisms before implementing systems for frequent citizen interactions.
1.4.3    Blockchain-Based Citizen Reporting and Complaint
## Management Systems
The traditional centralized platforms have data integrity issues, transparency is-
sues and trust issues when it comes to citizen reporting.  Past works also indicates
that centralized complaint registries often have single point of failures ,  delayed

## 6
responses and public mistrust.  Therefore blockchain integrated reporting services
can be used to mitigate those issues.
A blockchain based police complaint management system has proposed by Pratheeba
[6] contains a modular architecture.  It’s include security,  blockchain,  web inter-
face and a hybrid cloud storage.  This system ensure immutability of complaint
records by cryptographic hash linking.  And also it utilize RSA based encryption
to restrict the access only to authorized personnel.  In Addition to that, Pratheeba
used Natural Language Processing (NLP) techniques to automatically categorize
complaints in the system based on their priorities.
Figure 1.1:  System Architecture of the Police Complaint Management System.[1]
A three tier architecture for decentralized complaint management framework has
proposed  by  Manjula  [1]  is  shown  in  the  Figure  1.1.   The  three  layers  are  web
based presentation layer, a business logic layer and finally a blockchain data layer.
This system has a role based access control method to involve multiple stakehold-
ers.  Citizens, Law enforcement authorities and judicial bodies are some of them.
More importantly this system has a immutable storage for multimedia evidences.
Intelligent complaint assignment based on workloads, automatic escalation mecha-
nism are some of the key features of the framework.  The experimental evaluations
shows that a significant reductions in complaint processing time.  The successful
detection of data tampering also archived by blockchain verification.
In literature, existing blockchain based complaint management systems shows some
improvements  in  transparency  and  administrative  efficiency.   But  most  of  them

## 7
are domain specific.  They primarily target law enforcement or isolated governance
functions.  In addition to that several platforms still rely on centralized architec-
tures.  Only a limited attention is given for implementing a community assisted
validation, for privacy preserving reporting mechanisms and efficient handling of
multimedia evidences.  Therefore these limitations highlight the need for a gener-
alized reporting framework for local governance.
1.4.4    Permissioned Blockchains and PoA Consensus Mech-
anisms
Based on the participation and access control blockchain network can be classi-
fied in to two categories.  [7].  They are permissionless architecture (public) and
permissioned architecture.  Bitcoin and Early Ethereum networks are permission-
less blockchains.  They allowed unrestricted participation and relyed on consensus
mechanism like PoW or Proof of Stake (Proof-of-Stake (PoS))[8].  These architec-
tures and consensus mechanisms emphasized decentralization among participants.
But  they  often  suffer  from  the  high  latency  of  the  network,  limited  throughput
and unpredictable transaction costs due to congestion.  These problems make the
traditional permissionless PoW or PoS consensus mechanisms unsuitable for gov-
ernance and crowdsourced applications[9].
While  permissionless  blockchains  are  unsuitable  for  governance  related  applica-
tions,  permissioned  blockchains  restrict  the  network  participation  to  authorized
entities.   This  enables  more  efficient  consensus  mechanisms  and  greater  control
over governance data [7].  This known identities of participants allow permissioned
systems to achieve higher performance.  And support the regulatory compliances,
data privacy and structured governance models as well citemdpi2023unleashing.
Other than PoW and PoS consensus mechanisms, PoA offer significant advantages
over permissioned blockchains.  PoW requires energy intensive computation.  PoS
relies  on  the  economic  stake  and  introduce  wealth  centralization  risks.   But  on
the other hand PoA depends on the identity and the reputation of pre approved
validators[10], [11].  Therefore this PoA consensus mechanism enables high trans-
action  throughput  and  low  latency.   And  also  it  mitigate  the  issues  such  as  the
”nothing at stake” problem by off chain legal and reputational accountability [12],
## [13].
The  government  systems  should  have  accountability,  performance  predictability
and data confidentiality. The PoA is well suited consensus mechanism for that [14].
By using PoA we can have the ability to identify and regulate validator entities
to align blockchain operations.  It’s because we have the existing legal frameworks
that ensure institutional responsibility.  Hence, can avoid malicious behavior [15].
In Addition to that PoA avoids the indeterministic transaction fees and support
controlled validation environments.  This make them viable for handling sensitive

## 8
governmental data under regulatory constraints[11],[16].  As a result, PoA emerges
as a practical consensus mechanism for permissioned blockchain-based reporting
systems in local governance contexts.
1.4.5    Smart Contracts for Public Issue Management and
## Opinion Polling
In governance systems, to improve the transparency, efficiency and citizen partic-
ipation, smart contracts have been explored as the good mechanism.  Smart con-
tracts can automate the governance rules and incentives by immutable code.  It can
support models like civic intelligence governance (CIG). In CIG, citizen engage-
ment is encouraged through on chain participation and token based incentives[17].
Literature  shows  that  approaches  like  CIG  can  improve  participation  rates  and
knowledge sharing while reducing relances on centralized intermediaries.  In the
context of multi organizational governance smart contracts also been used within
dual blockchain architectures.  This method separates transaction data from con-
tract logic.  It balance the transparency and privacy in Government to Government
and Business to Business processes[18].
Smart contracts also support business processes in governance by embedding policy
rules directly into executable logic.  Bid submission, evaluation and contract exe-
cution are some of the use cases in the public procurement and tendering processes
that smart contract hold its value.  It also reduce the oppertunities for corruption
and increase the accountability[18], [19], [20].  Similar benefits are observed in the
blockchain based land registry systems.  Smart contracts have enable immutable
property records automated ownership transfers and enforcement of land use poli-
cies.  This has reduced fraud and administrative inefficiencies[21], [22].
In the context of voting and opinion polling,  smart contracts offer enhanced se-
curity, transparency, immutability and verifiability inherited from blockchain[23],
[24].  There are advance mechanisms such as Quadratic Voting and also blockchain
enabled  participatory  budgeting.   Those  mechanisms  further  extend  citizen  in-
volvement  in  decision  making.   It  have  expressive  preference  representation  and
transparent allocation of public resources[25], [26]. In addition to these advantages,
there exists some challenges related to scalability, privacy and system complexity
when deploying voting and polling systems to large and diverse populations[23],
## [27].

## 9
1.4.6    User  Interfaces  for  Blockchain-Based  e-Governance
## Applications
User interfaces play a critical role in determining the accessibility and adoption
of blockchain based e-governance systems.  In the traditional applications the user
literacy is less important but in this conventional blockchain applications the user
literacy is highly considered because of the blockchain concepts that are different
from the traditional apps and it does make the users hard to understand and adopt.
The  literature  consistently  identifies  usability  and  user  experience  challenges  as
major barriers to the adoption of decentralized applications for the general public.
Particularly where security requirements conflict with established usability princi-
ples [28], [29].  So the design of intuitive, inclusive, and responsive web interfaces
is essential for enabling effective interaction between citizens, government officials,
and the underlying blockchain infrastructure.
Usability Challenges in Decentralized Governance Systems
Decentralized applications are fundamentally different from traditional web sys-
tems due to its architectural characteristics.  Blockchain based systems have asyn-
chronous  transactions,  immutable  records,  and  cryptographic  identity  manage-
ment.  They can create friction for users who are used to centralized platforms.
Studies highlight a significant usability gap in Web3 applications because of the
concepts  like transaction  finality,  gas  fees,  and private  key  ownership  which  are
difficult for non technical users to understand and manage [28], [29].
Identity Management and Cognitive Load
One of the most critical usability barriers is wallet based identity management.
The reason is user identity is tied to cryptographic key pairs instead of institution
managed  accounts  In  decentralized  systems.   Research  shows  that  the  responsi-
bility of safeguarding private keys and the unrecoverble key loss red ce the user
participation.  Specially in general public where inclusivity is essential [29], [30],
## [31].
The literature further shows that concepts such as self-sovereign identity and iden-
tity management remain poorly understood by most users.  Studies report unsafe
practices and misunderstanding of recovery mechanisms when users are presented
with seed phrases or key-based authentication [32], [33].  These findings motivate
the  need  for  interface-level  abstractions  that  preserve  blockchain  security  while
reducing cognitive load for citizens and officials.

## 10
Transaction Latency and User Feedback
Blockchain transactions are inherently asynchronous with confirmation times de-
pendent on network conditions and consensus protocols.  This latency can lead to
confusion among the users because of the system status problems and users can
determine those as system failures [29].  The literature recommends to use an op-
timistic user interface pattern, where user actions are acknowledged immediately
while blockchain confirmation occurs in the background.
As advanced design solutions, literature shows progressive status disclosure, dis-
tinguishing between off-chain receipt of a report and on-chain verification which
allows users to track the lifecycle of an issue without being exposed to unneces-
sary low level blockchain details [34], [35].  Mechanisms like that are particularly
relevant for issue reporting systems that require transparency and trust.
Transaction Costs and Abstraction of Blockchain Complexity
A  significant  usability  challenge  coming  from  the  blockchain  is  transaction  cost
that  associated  with  public  blockchains.   And  also  the  concepts  of  gas  fees  and
fluctuating gas costs are very unfamiliar in public services context.  Most of the
time users expect free access to the reporting platforms[28]. The literature strongly
suggest that the use of gas fee abstraction techniques.  Meta Transactions is one of
the example.  In Meta, backend relayer services submit transactions on behalf of
the user.  Its achieved by preserving cryptographic intent verification[29].  There-
fore this approach enable citizen to interact with blockchain without technical or
economical complexities.
Comparison with Centralized Reporting Platforms
FixMyStreet and SeeClickFIx are existing centralized platforms.  Eventhough they
are centralized, they provide a valuable benchmarks for crowdsource citizen report-
ing interfaces.  Inituitive map based reporting, simple authentication mechanisms
and  clear  feedback  loops  are  the  key  characteristics  that  attributed  to  platform
success[36], [37].
With addition to that SeeClickFix further uses a gamification mechanism to en-
courage  the  users  to  participate  in  the  system.   In  contrast,  Even  though  the
proposed  application  uses  blockchain  for  reporting  platform,  it  must  retain  the
usability  and  the  expectations  of  the  users.   The  literature  highlights  the  need
of interface design such that gurantees the data integrity and auditability using
familiar ui elements rather than cryptographic representations[38], [35], [39].

## 11
Accessibility and Inclusivity Considerations
Inclusivity is a fundamental requirement for e-governance systems.  According to
[40], it can be seen that poorly designed blockchain interfaces may digitally divide
users.  Also it may favor crypto-literate users excluding vulnerable populations.  To
reduce this issue, literature suggests mobile first design approaches.  Furthermore,
lightweight client architectures, effiecient bandwidth synchronization can used to
support access in resource limited environments.  [41].
1.4.7    AI-Based Content Moderation in Civic Reporting
Since  blockchain  is  inheritably  immutable  its  introduce  a  unique  challenge  for
content  moderation  in  a  civic  reporting  system.   In  a  centralized  platforms,  ad-
ministrators  can  remove  or  edit  inappropriate  content.   But  in  a  decentralized
blockchain based system data cannot be altered once confirmed [42].  While im-
mutability strengthens transparency and accountability, it also raises the risk of
permanently storing harmful, illegal, or misleading content.  Therefore the litera-
ture focuses the need for pre moderation strategies to prevent unsuitable content
from being recorded on chain or to limit its visibility after publication [34].
1.4.8    Need for Automated Content Moderation
Civic reporting platforms are susceptible to several forms of misuse that can com-
promise  system  reliability  and  public  trust.   Automated  spam  submissions,  the
submission of malicious or legally sensitive content, and deliberate dissemination
of false or misleading reports are some of the common issues [43], [44], [45]. Manual
moderation is impractical for above situations.  Since the reporting system is large
latency, human bias, and operational costs can occur.  Furthermore it reintroduces
the centralized control structure that blockchain system is aim to minimize.
Therefore the literature supports AI assisted moderation as a scalable and efficient
approach  for  filtering  content  before  its  permanently  recorded.   It  maintain  the
acceptable levels of decentralization [46], [47].
1.4.9    Architectural Approaches for AI Blockchain Integra-
tion
Due  to  the  computational  and  storage  limitations  of  blockchain  platforms,  AI-
based  moderation  cannot  be  performed  directly  on  chain.   Off  chain  processing
combined with on chain verification identified by existing researches as most prac-
tical approach[47], [48].

## 12
In this approach, reported content is first analyzed by AI models hosted off chain
infrastructure or decentralized compute networks.  The outcome of this analysis
is  a  validation  decision  or  a  trust  score.   This  outcome  then  submitted  to  the
blockchain as a cryptographic proof or oracle response.  Next the smart contracts
verify those results before accepting the report.  It will ensure that only the con-
tent meeting predefined policies are recorded on chain.  BlockCITE is a example
framework demonstrate how this separation preserves blockchain integrity while
avoiding excessive on chain computation [49].
1.4.10    AI Oracles and Decentralized Oracle Networks
Oracles are trusted intermediaries that connect on chain and off chain.  In here the
AI oracles provides the computational results to smart contracts. Instead of simply
retrieving external data to the blockchain, AI oracle perform content classification
and  verification  tasks.   Then  it  returns  the  structured  results  to  the  blockchain
## [50], [51].
There  can  be  a  risk  of  oracle  bias  or  failure.   To  minimize  the  risk  a  decentral-
ized oracle networks aggregate outputs from multiple independent AI nodes and
determine consensus outcomes.  This model reduces reliance on a single AI sys-
tem.  Therefore it improves te robustness by requiring agreement among multiple
validators[51], [52].
Techniques for Content Analysis
AI-based moderation techniques vary based on the type of submitted content. NLP
models are widely used to detect spam, hate speech and misinformation for text
based reports.  Studies report high accuracy when combining deep learning models
with semantic embeddings.  It makes them suitable for filtering large volumes of
text submissions prior to blockchain recording [43].
For image based reports computer vision models are used to identify inappropriate
contents.  However recent advances in generative AI increase the risk of fabricated
images.  This literature proposes a hybrid verification pipeline that combine cryp-
tographic provenance mechanisms with AI-based image analysis.  This ensue that
the submitted media is both authentic and contextually valid [53].
Hybrid Human AI Moderation Models
AI enable the scalable moderation.  But it may struggle with contextual interpre-
tation and edge cases.  Because of that many studies advocate hybrid moderation
models.   In  those  models  AI  performs  initial  filtering  and  prioritization,  while
human reviewers handle disputed or ambiguous cases [46], [54].

## 13
Decentralized  community  based  moderation  further  complement  this  approach.
The models using community annotation systems, allow users or designated val-
idators to challenge AI decisions during predefined review periods.  In Addition to
that dispute resolution handled by transparent governance mechanisms [34], [55].
Therefore these strategies reduce the reliance on central authority while maintain
the accountability.
Ethical Considerations and Content Permanence
Ethical concerns are crucial when implementing systems by integrating AI driven
moderation systems. The algorithmic bias and the accountability are the highlights
in the literature.  Biased training data can lead to unfair rejection of legitimate
reports[56].  To minimize this risk explainable AI mechanisms are recommended.
This enable users to understand the moderation decision and resubmit corrected
reports [57].
Finally, the issue of “toxic immutability” remains a critical challenge for blockch
ain-based  systems.   To  resolve  this  issue  its  suggested  that  to  use  a  off  chain
storage systems like IPFS. If the content is later identified as illegal or harmful,
it can removed from the off chain storage.  But can preserve the immutable audit
trail by recording it on the blockchain[53].  The transparency, legal compliance and
ethical responsibility can be balanced by this approach.
## 1.5    Report Outline
This report is organized into six main chapters.  Each chapter focuses on a different
part of the project, from the problem background to the current implementation
progress and future work.
Chapter 1 introduces the research problem and explains why a privacy-preserving
reporting  system  is  needed  for  local  governance.   It  presents  the  problem  back-
ground,  problem  statement,  objectives,  scope,  and  literature  review  related  to
citizen reporting systems,  blockchain-based governance,  AI moderation,  and de-
centralized applications.
Chapter  2  provides  the  technical  background  required  to  understand  the  pro-
posed  system.    It  explains  the  main  technologies  used  in  the  project,  includ-
ing blockchain, permissioned blockchain with Proof-of-Authority consensus, smart
contracts, DApps, IPFS, identity privacy concepts, and AI-based content moder-
ation.
Chapter 3 describes the methodology and implementation of the proposed frame-
work.  It explains the research approach, system requirements, overall architecture,
workflow, project timeline, and expected outcomes. It also describes the implemen-
tation progress of the main components, including the private blockchain, smart

## 14
contracts, identity service, backend relayer, IPFS integration, AI moderation ser-
vice, and web-based DApp.
Chapter 4 presents the testing, experimentation, and validation approach.  It de-
scribes the experimental setup, testing methodology, subsystem testing, integra-
tion testing, and preliminary validation of the implemented components.  It also
discusses the current results and compares the proposed approach with existing
reporting systems.
Chapter  5  discusses  the  main  findings  of  the  project.   It  highlights  the  impor-
tant  contributions  of  the  proposed  methodology  and  implementation,  evaluates
the  progress  against  the  project  objectives,  and  explains  the  limitations  of  the
current prototype.
Chapter 6 concludes the report by summarizing the overall progress and signifi-
cance of the project.  It also presents the future work required to complete and
improve the system, including full integration, image moderation, government-side
workflows, stronger identity mechanisms, and further testing.

## 15
## Chapter 2
## Background
## 2.1    Blockchain Technology
Blockchain is a distributed, digital, append-only ledger technology.  It enables data
to be stored in immutable and transparent manner across multiple nodes in a net-
work.  Unlike centralized systems, blockchain systems maintain a syncronized copy
of the ledger among all authorized participants.  This approach reduces the depen-
dency on a single intermediary controlling authority.  Each block in the blockchain
contains a set of validated transactions, a timestamp, and a cryptographic hash of
the previous block.  This hash-chaining mechanism ensures that any alteration to
previous recorded data becomes immediately detectable.
Immutability is a key characteristic in blockchain technology. It is computationally
impractical to alter or delete a transaction after it is confirmed and appened to
the blockchain.  The immutable property is significantly important in governance-
related systems, because integrity and transparency are a must.
Cryptography plays a significant role in blockchain systems.  To generate unique
digital  fingerprints  of  data,  hash  functions  are  used.   To  verify  ownership  and
authenticity  of  transactions,  digital  signatures  are  used.   By  using  above  cryp-
tographic methods, blockchain systems gurantee integirty, authenticity and non-
repudiation of data.
2.2    Permissioned Blockchain and PoA
Bitcoin and Ethereum are permissionless blockchains, where anyone can partici-
pate as a node and validate transactions.  In contrast,  permissioned blockchains
restrict participation to a predefined set of entities.  These entities, often referred
to as validator nodes.  They are responsible for validating transactions and main-
taining the integrity of the blockchain.

## 16
While permissionless blockchains rely on consensus mechanisms like PoW or PoS,
the PoA consensus mechanism is specially designed for permissioned blockchains.
In here instead of relying on computationally expensive mining or staking process
the validator nodes in the permissioned blockchain are validating blocks. Therefore
this approach is a reputation and indetity-based mechanism, where the authority
of the validators is based on their identity and reputation within the network.  This
allows for faster transaction processing and lower energy consumption compared
to traditional consensus mechanisms, making it suitable for enterprise applications
and private networks.
In the context of local governance perspective,  such system requires predictable
performance, immutability, transparency and accountability.  PoA consensus run-
ning  in  a  permissioned  blockchain  is  well  suited  for  this  requirements  because
validators identities are known and they controlled by trusted entities.  With addi-
tion to that, PoA eliminates the need for economic incentives.  This make it more
efficient and practical for local governance applications.
## 2.3    Smart Contracts
Smart  contracts  are  first  introduced  by  Ethereum  blockchain.    They  are  self-
executing  contracts  with  the  terms  of  the  agreement  directly  written  into  code.
In  a  blockchain  based  governance  systems  smart  contract  can  be  used  to  elim-
inate  centralized  administrative  control.   It  can  automate  workflows  that  would
traditionally  require  human  intervention.   Therefore  this  reduce  the  reliance  on
intermediaries, hence improve the transparancy and trusthworthiness.
The proposed system uses Solidity based smart contracts deployed on a private
permissioned PoA blockchain.
2.4    Decentralized Applications (DApps)
DApps are software applications that operate on a decentralized network, such as
a blockchain, rather than being hosted on centralized servers.  Unlike traditional
web  applications  that  rely  on  centralized  databases  and  backend  infrastructure,
DApps utilize smart contracts to handle backend logic and state management. This
shift from traditional Web2 to Web3 architecture ensures that application data is
immutable,  transparent,  and  resistant  to  single  points  of  failure  or  centralized
control.
In  a  typical  DApp  architecture,  the  frontend  provides  the  user  interface,  while
the  core  logic  is  distributed  across  the  blockchain  network.    To  interact  with
the blockchain, the frontend utilizes Web3 provider libraries, such as Web3.js or
Ethers.js.  These libraries enable the application to communicate with blockchain

## 17
nodes via Remote Procedure Calls (Remote Procedure Call (RPC)). Through this
connection,  the  frontend  can  query  the  blockchain  to  read  the  current  state  of
smart  contracts  or  construct  new  transactions.   When  a  user  wishes  to  modify
the blockchain state, they must cryptographically sign the transaction using their
digital wallet’s private key, ensuring authenticity and authorization.
A significant challenge in traditional DApp adoption is the requirement for users
to  pay  transaction  fees,  commonly  known  as  ”gas,”  using  the  native  cryptocur-
rency of the network.  This creates a barrier to entry for regular users who may
not possess or understand cryptocurrency.  To address this usability issue, modern
DApps employ meta-transactions and relayers.  A meta-transaction allows a user
to cryptographically sign their intent to execute a transaction off-chain without
broadcasting it themselves.  This signed message is then sent to an intermediary
service known as a relayer.  The relayer, which holds a balance of the network’s
cryptocurrency, wraps the user’s signed message in a standard blockchain trans-
action, submits it to the network on behalf of the user, and pays the associated
gas fees.  This approach provides a seamless, ”gasless” user experience while main-
taining the security and non-repudiation guarantees of cryptographic signatures,
making blockchain applications more accessible to the general public.
2.5    InterPlanetary File System (IPFS)
InterPlanetary  File  System  (IPFS)  is  a  peer-to-peer  network  protocol  designed
for  storing  and  sharing  files  in  a  decentralized  manner.   Unlike  the  traditional
web, where files are identified and accessed through server-based addresses such as
URLs, IPFS locates files based on their content.  This content-addressed approach
improves  resilience,  reduces  dependence  on  centralized  servers,  and  provides  an
efficient off-chain storage mechanism for blockchain-based applications.  A funda-
mental concept in IPFS is the Content Identifier (Content Identifier (CID)), which
is  a  cryptographic  hash  generated  from  the  content  of  a  file.   If  the  file  content
changes, the CID also changes, ensuring strong integrity guarantees because users
can  verify  that  the  retrieved  content  exactly  matches  the  expected  CID.  Since
identical content generates the same CID, IPFS also supports deduplication and
immutable references.  In the IPFS network, data can be hosted by any node that
chooses  to  store  or  pin  the  content,  allowing  files  to  be  retrieved  from  multiple
peers using their CID. This decentralized storage model increases availability, im-
proves fault tolerance, and reduces reliance on a single server, although long-term
persistence depends on nodes continuing to pin the data.  In blockchain-based sys-
tems, IPFS is commonly used as an off-chain storage layer because storing large
files  directly  on-chain  is  costly  and  inefficient.   Instead,  applications  store  only
CIDs and essential metadata on the blockchain, while the actual content remains

## 18
in IPFS. Users can then retrieve the file through its CID and verify its authenticity
using cryptographic hashing.  Overall, IPFS provides a scalable and cost-effective
decentralized storage solution that combines content integrity, distributed hosting,
and efficient off-chain data management.
2.6    Zero-Knowledge and Identity Concepts
Zero-knowledge proofs allow a user to prove that they possess sensitive information
without actually revaling the information itself.
The  identity  decoupling  is  critical  requirment  because  citizens  may  hesitate  to
report  sensitive  problems  they  have  if  their  identity  is  linked  to  the  submitted
report.  Therefore we decouple identity of the citizen by using public-private key
pair associated with the citizen.  By leveraging this approach the blockchain ledger
will record only pseudonymous identifiers, authorization tickets and cryptographic
proofs.  This ensure no sensitive personal information is ever oublically exposed.
2.7    AI-based Content Moderation
Citizen reporting platforms are vulnerable to spam Submissions, abusive content,
misinformation, and malicious reports.  Due to immutability of blockchain records,
permanently storing harmful content presents significant ethical and operational
concerns.   Therefore,  content  moderation  techniques  are  required  before  reports
are recorded on-chain.
AI techniques are widely used for automated content moderation.  NLP techniques
are used in text moderation tasks such as:toxicity detection, hate speech detection,
spam filtering,  and sentiment Analysis.  For image moderation,  computer vision
and  deep  learning  approaches  are  mostly  used.   Convolutional  Neural  Networks
(Convolutional Neural Network (CNN)s) and transformer-based vision models can
classify  images  based  on categories  like:  explicit  content,  graphic  violence,  hate
symbols, and unrelated media.

## 19
## Chapter 3
Methodology and Implementation
## 3.1    Methodology
## 3.1.1    Research Methodology
This project follows a design-oriented and prototype-based research methodology.
The  main  objective  is  to  design,  implement,  and  evaluate  a  blockchain-based,
community-assisted, privacy-preserving reporting framework for local governance.
The system is developed as a functional prototype within a controlled experimental
environment rather than as a large-scale production deployment.
The research approach is based on identifying the limitations of existing centralized
citizen reporting platforms and designing a decentralized alternative that improves
transparency,  integrity,  anonymity,  and  trustworthiness.   The  project  combines
several technologies, including a private permissioned blockchain, smart contracts,
a simulated identity verification mechanism, off-chain storage, AI-assisted content
moderation, and a web-based decentralized application.
The system is developed using an incremental and modular development approach.
Each major subsystem is designed and implemented independently before being
integrated  into  the  complete  reporting  workflow.   This  reduces  complexity  and
allows each team member to focus on a specific technical component while main-
taining compatibility with the overall architecture.
The major system components are:
-  Web-based DApp
-  ZKP GovID simulator
-  Backend relayer
-  AI moderation oracle service

## 20
-  IPFS off-chain storage
-  Smart contracts
-  Private permissioned PoA blockchain
Each  subsystem  is  first  implemented  and  tested  individually.   After  subsystem-
level validation, the components are connected through defined APIs, blockchain
interfaces, and data formats. The final integration focuses on the end-to-end report
submission scenario, where a citizen submits a report through the DApp, the report
is validated and moderated, the content is stored off-chain, and the final metadata
is recorded on-chain.
This approach follows the phased methodology described in the project proposal,
where requirement analysis, system design, blockchain implementation, smart con-
tract development, identity integration, IPFS integration, AI moderation, DApp
development, testing, and evaluation are carried out incrementally.
## 3.1.2    System Requirements Analysis
## Functional Requirements
The functional requirements define the main services that the system must provide.
-  Citizen authentication:  A citizen should be able to authenticate using the
simulated GovID identity service.
-  Ticket issuance: After successful verification, the identity service should issue
a citizen seed and a batch of one-time ticket IDs.
-  Report creation:  A citizen should be able to create a report containing text,
category, location, timestamp, and optional media.
-  Payload signing: The DApp should sign the report payload using the citizen’s
private key before sending it to the relayer.
-  Relayer  verification:  The  backend  relayer  should  verify  the  ticket,  citizen
signature, payload hash, and file constraints.
-  AI moderation:  The report content should be analyzed by AI moderation
services before blockchain submission.
-  Off-chain  storage:  Accepted  report  content  and  media  files  should  be  up-
loaded to IPFS.

## 21
-  Blockchain submission: The relayer should submit accepted report metadata
to the reporting smart contract.
-  Report retrieval:  The DApp should allow citizens and authorized users to
read submitted reports and their statuses from the blockchain.
-  Government  action  workflow:   The  system  should  support  future  integra-
tion of government-side actions such as issue review, resolution updates, and
closure.
## Non-functional Requirements
The system also has several non-functional requirements.
-  Security: The system should use hashing, digital signatures, ticket validation,
role-based access control, and secure API communication.
-  Privacy: Citizen identities should be decoupled from on-chain report records.
-  Integrity:  Report payloads, IPFS content, oracle decisions, and blockchain
records should be tamper-evident.
-  Availability:  The deployed services should remain accessible during testing
and demonstration.
-  Performance:  The system should process reports within reasonable time un-
der prototype workloads.
-  Maintainability: The system should be modular and containerized to simplify
deployment and debugging.
-  Auditability:  Important workflow decisions should be logged and anchored
through hashes or blockchain events.
## 3.1.3    Proposed System Architecture
## Overall System Architecture
The proposed system uses a hybrid decentralized architecture that combines on-
chain  and  off-chain  components.   The  blockchain  is  responsible  for  storing  im-
mutable  metadata,  workflow  states,  and  references  to  report  content.   Compu-
tationally intensive and large-data operations are handled off-chain through the
relayer, AI moderation service, and IPFS. The overall architecture of the system
is shown in the Figure 3.1

## 22
## Figure 3.1:  High Level Architecture Diagram.

## 23
The DApp acts as the citizen-facing interface.  The ZKP GovID simulator handles
identity  verification  and  ticket  issuance.   The  backend  relayer  verifies  signed  re-
port submissions and coordinates communication between AI moderation, IPFS,
and smart contracts.  The AI moderation service evaluates report content before
storage and blockchain submission.  IPFS stores large report data and media evi-
dence, while the smart contracts manage the report lifecycle on the private PoA
blockchain.
This architecture supports the main project goal of preserving citizen anonymity
while  maintaining  report  integrity  and  transparency.   The  use  of  a  relayer  also
improves usability because citizens do not need to directly manage gas payments
or manually submit blockchain transactions.
## Layered Architecture
The system can be divided into six major layers.
-  User Layer:  This layer consists of the citizens and government officials.
-  Presentation layer: This layer consists of the DApp used by citizens and gov-
ernment officials.  It provides interfaces for login, report submission, report
viewing, and future government-side actions.
-  Identity  and  authentication  layer:   This  layer  consists  of  the  ZKP  GovID
simulator.   It  verifies  citizens  and  issues  citizen  seeds  and  ticket  batches.
This separates real identity verification from on-chain activity.
-  Middleware orchestration layer: The backend relayer acts as the coordination
layer.  It receives signed report payloads, performs validations, calls AI mod-
eration services, uploads accepted content to IPFS, and submits blockchain
transactions.
-  Off-chain services layer:  This layer includes the AI moderation service and
IPFS storage.  These components handle tasks that are unsuitable for direct
blockchain execution.
-  Blockchain  layer:   This  layer  consists  of  the  smart  contracts  and  the  pri-
vate PoA blockchain.  It stores immutable metadata, report states, content
hashes, IPFS CIDs, and workflow events.
## 3.1.4    Proposed Workflow
The proposed architecture operationalizes the decentralized reporting framework
through a series of distinct, cryptographically secure workflows.  These workflows

## 24
ensure that civic participation remains entirely anonymous to the public and the
smart contract, while simultaneously guaranteeing that only verified citizens can
submit legitimate data.
Citizen Authentication and Identity Workflow
The authentication workflow bridges real-world civic identity with anonymous on-
chain participation without exposing Personally Identifiable Information (Person-
ally Identifiable Information (PII)) to the blockchain network.  This is achieved
through the integration of the ZKP-GovID Simulator, which acts as the centralized
trust anchor for identity verification.  The workflow is shown in Figure 3.2.
The step-by-step authentication process executes as follows:
-  The citizen accesses the decentralized application frontend and inputs their
official national identification number and password.
-  The frontend transmits these credentials over an encrypted channel to the
ZKP-GovID Simulator for verification against the mock government registry.
-  Upon successful credential validation, the simulator generates a predefined
batch of randomized, single-use ticket identifiers.  These identifiers contain
no personal data and serve purely as cryptographic tokens.
-  The simulator utilizes the official Government Authority private key to cryp-
tographically sign each randomized ticket identifier.
-  The  generated  batch  of  signed  tickets,  along  with  a  citizen  seed  value,  is
returned  to  the  decentralized  application  and  stored  securely  in  the  local
browser environment.  These tickets function as anonymous, verifiable hall-
passes for future platform interactions.
## Overall System Lifecycle Workflow
The overall system workflow combines all the separate steps into one complete flow
for a civic issue.  It tracks a report from the moment a citizen creates it until the
government resolves it and the repair is verified.  This big-picture view shows how
the off-chain middleware, decentralized storage, the AI moderation tool, and the
smart contract all work together.  The complete lifecycle is shown in Figure 3.3.
The progression of a civic report executes sequentially as follows:
-  The lifecycle initiates with the citizen authenticating their real-world identity
through the centralized simulator to securely acquire a batch of anonymous
cryptographic tickets.

## 25
Figure 3.2:  Citizen Authentication and Identity Workflow

## 26
-  Utilizing an acquired ticket, the citizen constructs and submits a civic issue
report accompanied by a cryptographic signature.
-  The backend relayer intercepts the payload, routing it through the AI mod-
eration ensemble to filter malicious content,  and subsequently uploads the
approved media to the decentralized storage network.
-  The relayer formulates the blockchain transaction and anchors the lightweight
metadata to the smart contract, placing the report into the initial pending
validation state.
-  The  local  community  evaluates  the  pending  report.   Reaching  the  rejec-
tion threshold terminates the issue, while reaching the validation threshold
transitions the report to an open state,  formally notifying the government
authority.
-  The assigned authority acknowledges the validated issue and triggers a state
transition to indicate that active, physical repairs are currently in progress.
-  Upon concluding the physical intervention, the authority updates the smart
contract to mark the issue as solved, which temporarily shifts the report into
a pending verification state.
-  The community conducts a final,  physical review of the repaired site.  An
acceptance  consensus  transitions  the  report  to  the  terminal  closed  state,
whereas a rejection consensus reopens the issue, mandating the authority to
rectify the inadequate repair.
## Report Submission Workflow
The  report  submission  workflow  represents  the  core  operational  pipeline  of  the
framework.    It  delegates  heavy  computational  tasks,  such  as  content  modera-
tion and file storage, to off-chain middleware, ensuring the blockchain remains a
lightweight and gas-efficient state machine.  The workflow is shown in Figure 3.4.
When  a  citizen  initiates  a  civic  issue  report,  the  system  executes  the  following
deterministic pipeline:
-  The  citizen  drafts  a  description  of  the  civic  issue  and  optionally  attaches
multimedia evidence via the frontend interface.
-  The  frontend  application  selects  one  unused  signed  ticket  from  the  local
batch.   It  generates  a  cryptographic  hash  combining  the  issue  description
and the ticket identifier, and subsequently signs this hash using the citizen’s
local wallet private key.

## 27
-  The application transmits the complete payload, including the raw text, me-
dia files, government-signed ticket, and the citizen’s signature, to the backend
relayer via a secure HTTP request.
-  The backend relayer performs a strict dual-layer cryptographic verification.
First, it fetches the Government Authority public key to verify the authen-
ticity  of  the  ticket.   Second,  it  verifies  the  citizen’s  signature  against  the
payload hash to detect any tampering during transit.
-  If cryptographic verification succeeds, the relayer routes the submitted text
and media to the AI moderation ensemble.  The centralized aggregator node
processes the inputs through its algorithmic nodes to determine if the content
is appropriate or malicious spam.
-  Upon receiving an approval verdict from the AI oracle, the backend relayer of-
floads the multimedia files to IPFS. The IPFS network returns an immutable
CID representing the stored files.
-  The relayer formulates a blockchain transaction containing only the lightweight
IPFS CID and the ticket identifier.  To ensure a gasless experience for the
citizen, the relayer signs this transaction with its own wallet and pays the
necessary network fees.
-  The Reporting smart contract receives the transaction. It immediately checks
the provided ticket identifier against its internal nullifier mapping to prevent
replay attacks and duplicate submissions.
-  Once  the  nullifier  is  marked  as  consumed,  the  smart  contract  successfully
anchors  the  report  to  the  ledger,  initializing  it  in  the  Pending  Validation
state to await community consensus.
Community Consensus and Validation Workflow
This workflow outlines the mechanism by which the decentralized community fil-
ters out spam and validates the legitimacy of submitted civic issues.  It ensures
that only genuine reports escalate to the government authorities, thereby optimiz-
ing resource allocation.  The workflow is shown in Figure 3.5.
The validation process executes through the following steps:
-  A newly submitted report enters the Pending Validation state on the smart
contract and becomes visible on the community feed within the decentralized
application.

## 28
-  A registered citizen physically observes the issue in the real world and decides
to corroborate the report.
-  The citizen utilizes the application to cast an upvote.  To ensure Sybil resis-
tance, the application binds a new, unused Zero-Knowledge ticket from the
citizen’s local batch to this specific vote and signs the payload.
-  The backend relayer intercepts the voting payload, cryptographically verifies
the ticket and signature, and submits the vote to the smart contract.
-  The smart contract verifies that the ticket nullifier has not been used for this
specific voting phase of this specific report.
-  The contract increments the vote tally.  Once the tally surpasses the prede-
fined validation threshold, the smart contract automatically executes a state
transition,  moving  the  report  from  Pending  Validation  to  the  Open  state,
making it actionable for authorities.
Authority Resolution and Action Workflow
This workflow defines how authorized government or non-governmental organiza-
tion nodes interact with the validated civic issues on the blockchain.  It establishes
the  transparency  of  the  physical  repair  process.   The  workflow  is  shown  in  Fig-
ure 3.6.
The authority interaction proceeds as follows:
-  The  government  authority  monitors  the  blockchain  state  via  a  dedicated
dashboard, filtering for reports that have successfully reached the Open state.
-  Upon dispatching a physical repair crew to the location, the authority sub-
mits a transaction to the smart contract invoking the state change function.
-  The smart contract validates the transaction signature against its Role-Based
Access Control (RBAC) list to ensure the sender possesses the required au-
thority permissions.
-  Upon permission validation, the contract updates the report state from Open
to In Progress, providing real-time transparency to the observing community.
-  Once the physical repair is concluded, the authority submits a subsequent
transaction to mark the issue as solved.
-  The smart contract processes this transaction and transitions the report into
the Pending Verification state, temporarily halting the authority’s involve-
ment until the community responds.

## 29
Post-Resolution Verification and Appeal Workflow
The final workflow enforces the system’s core accountability mechanism.  It guar-
antees that government authorities cannot unilaterally close a report without the
community physically confirming that the job was completed satisfactorily.  The
workflow is shown in Figure 3.7.
The verification process executes as follows:
-  Citizens in the vicinity of the purportedly resolved issue inspect the physical
location to confirm the repair quality.
-  Citizens utilize the decentralized application to cast a verification vote (ac-
cepting or rejecting the repair), utilizing the same secure, ticket-based nulli-
fier mechanism to ensure one-citizen-one-vote integrity.
-  The backend relayer processes and forwards these verification votes to the
smart contract.
-  If the positive verification votes reach the required threshold, the smart con-
tract transitions the report to the terminal Closed state, permanently archiv-
ing the successful resolution.
-  Conversely, if the negative votes reach the rejection threshold (indicating a
poor or non-existent repair), the smart contract transitions the report to the
Reopened state.
-  A transition to the Reopened state forces the report back onto the authority’s
active dashboard, mandating further physical intervention and a repetition
of the resolution workflow.
3.1.5    Project Plan and Timeline
## Project Plan
The  project  plan  is  organized  according  to  the  main  implementation  phases  of
the system.  Each phase focuses on a specific part of the proposed framework and
contributes  to  the  final  integrated  prototype.   Table  3.1  summarizes  the  major
phases, key activities, expected outputs, and current progress status.

## 30
Table 3.1:  Project plan and current progress
PhaseMain ActivitiesExpected OutputCurrent
## Status
## Background
Study  and  Liter-
ature Review
Study  existing  e-governance
systems,blockchain-based
reporting    platforms,PoA
consensus,  IPFS,  AI  moder-
ation, and DApp usability.
## Identificationofre-
search  gap  and  techni-
cal foundation.
## Completed
## Requirement
## Analysis
Define  functional  and  non-
functional   requirements   for
citizens, government officials,
relayer,  blockchain,  storage,
and moderation components.
Requirement  specifica-
tion  and  use-case  un-
derstanding.
## Completed
System DesignDesign  overall  architecture,
component  interactions,  re-
port   submission   workflow,
identity  model,  and  deploy-
ment architecture.
High-level   system   de-
sign  and  workflow  dia-
grams.
## Completed
## Permissioned
## Blockchain Setup
ConfigureprivateGeth
blockchain,  PoA  consensus,
validator   nodes,   and   RPC
access.
Working   private   per-
missionedblockchain
network.
## Completed
SmartContract
## Development
Implement   report   creation,
report state management, ac-
cess   control,   ticket   valida-
tion, and event emission.
Reporting   smart   con-
tract  for  managing  is-
sue lifecycle.
## In Progress
Identity  and  Ac-
cess Control
Implement simulated GovID
verification, citizen seed gen-
eration,  ticket batch genera-
tion, and pseudonymous key
generation.
## Privacy-preserving
identityandaccess
control mechanism.
## Partially
## Completed
## Backend   Relayer
## Development
Implement   payload   valida-
tion,  citizen signature verifi-
cation,  ticket  validation,  or-
acle   communication,   IPFS
upload,  and  smart  contract
transaction submission.
## Middlewareservice
connectingDApp,
oracle,IPFS,and
blockchain.
## In Progress
Continued on next page

## 31
Table 3.1 continued
PhaseMain ActivitiesExpected OutputCurrent
## Status
AI Oracle Moder-
ation Service
Implement three oracle work-
ers, aggregator, voting logic,
decision  hashing,   and  con-
tainerized VPS deployment.
Deployed   AI   modera-
tion   service   for   text-
based    report    valida-
tion.
## Completed
forText
## Moderation
IPFSOff-chain
## Storage    Integra-
tion
## Uploadreportcontent
and  media  to  IPFS,  retrieve
CIDs, and verify file integrity
using hashes.
Off-chain storage mech-
anism   for   report   evi-
dence.
## In Progress
Web-based  DApp
## Development
Develop citizen login, report
submission,  report  viewing,
category  selection,   and  fu-
ture   government-side   inter-
faces.
User-facing  web  appli-
cation.
## In Progress
## Subsystem   Test-
ing
Test DApp, smart contracts,
AI oracle service, GovID sim-
ulator, IPFS, and relayer in-
dependently.
Verified  subsystem  be-
havior.
## In Progress
SystemInte-
grationand
## Evaluation
Integrate all components and
test  the  full  report  submis-
sion workflow from DApp to
blockchain.
Functional   end-to-end
prototype  and  evalua-
tion results.
## Pending
## Final Demonstra-
tion
Prepare  final  system  demo,
report, and presentation.
## Demonstrablepro-
totypeandfinal
documentation.
## Pending

## 32
Figure  3.3:   Overall  lifecycle  workflow  of  a  civic  issue  within  the  decentralized
framework.

## 33
## Figure 3.4:  Report Submission Workflow

## 34
## Figure 3.5:  Community Validation Workflow

## 35
Figure 3.6:  Authority Resolution and Action Workflow

## 36
Figure 3.7:  Post-Resolution Verification and Appeal Workflow

## 37
## Project Timeline
The project is planned to be completed over two academic semesters using an in-
cremental development approach.  The work is divided into several phases, starting
from background study and requirement analysis, followed by system design, sub-
system implementation, integration, testing, and final evaluation.
The timeline shown in Figure 3.8 was prepared to guide the development process
and  to  allocate  sufficient  time  for  each  major  component  of  the  system.   Since
this is a progress report, some implementation activities are still ongoing.  At the
current  stage,  the  main  focus  is  on  completing  subsystem  implementation  and
moving toward full system integration for the report submission workflow.
## 3.1.6    Expected Outcomes
The expected outcome of the project is a working prototype of a privacy-preserving,
blockchain-based citizen reporting system for local governance.
The system is expected to achieve the following outcomes:
-  Anonymous  civic  reporting:  Citizens  can  submit  reports  without  directly
revealing their real-world identity on-chain.
-  Tamper-evident records:  Report metadata, hashes, and workflow states are
recorded on a private blockchain.
-  Improved report reliability: AI-assisted moderation helps detect spam, abuse,
and irrelevant submissions before blockchain anchoring.
-  Scalable  storage:   Large  report  content  and  media  evidence  are  stored  in
IPFS, while blockchain stores only metadata and references.
-  Usable  blockchain  interaction:   The  relayer  pattern  removes  the  need  for
citizens to directly manage gas fees or blockchain transactions.
-  Modular deployment: The system is designed as a collection of independently
deployable components.
-  Governance transparency:  The  blockchain  provides  an auditable record  of
report submission and status changes.
Through these outcomes, the prototype demonstrates the feasibility of combining
blockchain, privacy-preserving identity mechanisms, off-chain storage, AI-assisted
moderation, and web-based DApp interfaces to support transparent and account-
able local governance reporting.

## 38
## NOV
## DEC
## JAN
## FEB
## MAR
## APR
## MAY
## JUNE
## JULY
## AUG
## 1
## 2
## 3
## 4
## 5
## 6
## 7
## 8
## 9
## 10
## 11
## 12
## 13
## 14
## 15
## 16
## 17
## 18
## 19
## 20
## 21
## 22
## 23
## 24
## 25
## 26
## 27
## 28
## 29
## 30
## 31
## 32
## 33
## 34
## 35
## 36
## 37
Grouping & Project SelectionBackground StudyLiterature ReviewRequirement AnalysisProject Proposal PreparationProposal EvaluationComplete System DesignPermissioned Blockchain SetupSmart Contract DevelopmentIdentity & Access ControlImplementationBackend Relayer DevelopmentIPFS Off-chain Storage IntegrationAI Oracle Moderation ServiceWeb-based DApp DevelopmentSubsystem TestingEnd-to-End Report SubmissionIntegrationPerformance and FunctionalEvaluationFinal Demonstration
## Figure 3.8:  Project Timeline Gantt Chart

## 39
## 3.2    Implementation
## 3.2.1    Permissioned Blockchain Implementation
The  core  infrastructure  of  the  proposed  system  is  the  private  permissioned
blockchain network.  The implementation focused on setting up a secure and effi-
cient environment tailored for local governance applications.
  Geth  PoA  Network  Setup:   A  private  permissioned  Ethereum-compatible
network was initialized using the Go Ethereum client.  The network was con-
figured  to  operate  in  proof-of-authority  consensus  mode,  specifically  using
the Clique algorithm.  This enabled faster block confirmation and lower en-
ergy consumption compared to traditional proof-of-work systems.  A custom
genesis file was created to define network parameters,  including the initial
set of authorized signers and the chain ID.
  Validator Node Configuration: Minimum of three full nodes were required to
act as an validator.  The 3 nodes are deployed in a personal vps infrastruc-
ture.  Each node is configured with a unique cryptographic identity and their
addresses were added to the list of authorized sealers within the consensus
engine to manage transaction validation authority.
  Network Security Measures:  To communicate with the blockchain network,
secure RPC endpoint was established only for node1.  Additionally, the net-
work is configured to operate in a private subnet, further isolating it from
external threats.  This configuration allowed DApp and smart contracts to
communicate with ledger enabling functions such as report submission, trans-
action querying and state synchronization.
3.2.2    Smart Contract Architecture and Logic
The core on-chain logic of the decentralized reporting framework is governed by the
Reporting.sol smart contract.  This contract is designed to be highly gas-efficient,
acting primarily as a state machine and a cryptographic ledger rather than a data
storage layer.  The implementation is divided into three critical functional domains
as The Report Contract structure, Ticket Validation, and State Transition Logic.
## The Report Contract
The Report Contract is engineered using a Separation of Concerns principle.  To
mitigate the prohibitive gas costs associated with storing large multimedia files on
the blockchain, the contract only stores essential metadata.

## 40
-  Data Structure:  Each civic issue is stored in a Report struct containing a
unique integer ID, the IPFS CID pointing to off-chain media, voting counters,
the assigned authority address, and its current lifecycle state.
-  Role-Based  Access  Control  (RBAC):  Utilizing  OpenZeppelin’s  AccessCon-
trol, the contract explicitly defines operational boundaries. The RELAYER
## ROLE
is restricted to the backend server, allowing it to submit reports and relay
votes on behalf of citizens.  The AUTHORITYROLE is granted to recog-
nized  government  or  NGO  nodes,  granting  them  permission  to  update  an
issue’s status to solved or rejected.
Ticket Validation and Sybil Resistance
A fundamental challenge in anonymous decentralized systems is preventing Sybil
attacks  and  duplicate  submissions.   This  framework  utilizes  a  dual-layer  valida-
tion mechanism based on Zero-Knowledge Proof (Zero-Knowledge Proof (ZKP))
tickets.
-  Off-Chain Cryptographic Validation: Before a transaction reaches the blockchain,
the backend relayer intercepts the payload. Using ethers.js, it verifies that the
zkpTicketId possesses a valid cryptographic signature from the official Gov-
ernment  Authority.   It  subsequently  verifies  the  citizen’s  signature  against
the payload hash to ensure data integrity during transmission.
-  On-Chain  Nullifier  Tracking:  Once  validated  off-chain,  the  zkpTicketId  is
passed to the smart contract as a submissionNullifier.  The contract main-
tains a mapping of public submissionNullifiers.  Upon successful report cre-
ation, this nullifier is marked as used.  Any subsequent attempt to submit a
report using the same ticket will systematically fail, cryptographically guar-
anteeing that one authorized ticket equates to exactly one unique report.
## State Transition Logic
To enforce accountability and prevent unilateral dismissals of civic issues by au-
thorities, the contract implements a strict Finite State Machine (Finite State Ma-
chine (FSM)). Every submitted report strictly adheres to an 8-stage lifecycle man-
aged via an on-chain enum:
-  Pending Validation:  Initial state awaiting community confirmation of legiti-
macy.
-  Community Rejected:  Terminal state for spam or invalid issues.
-  Open:  Validated by citizens and actively awaiting government action.

## 41
Figure 3.9:  State transition diagram for the civic reporting system.
-  In Progress:  The authority has officially acknowledged the issue and is ac-
tively executing physical repairs or resolution steps.
-  Pending Rejection Review:  The authority dismissed the issue, triggering a
community appeal phase.
-  Pending Verification:  The authority marked the active work as completed,
triggering a mandatory community verification vote.
-  Closed:   Terminal  state  indicating  a  successfully  verified  resolution  or  an
accepted rejection.
-  Reopened: The community rejected the authority’s fix, forcing the issue back
to the authority for rework.
A report must traverse these specific states driven by a combination of authority
actions and community consensus thresholds.
-  Community-Driven Transitions:  When a report is submitted, it enters the
Pending Validation state.  The transition to the Open state (making it visi-
ble for government action) only occurs automatically via the
changeStatus()
internal  function  once  community  upvotes  reach  the  predefined  VALIDA-
TIONTHRESHOLD. Conversely, reaching the REJECTIONTHRESHOLD
moves it to the terminal Community Rejected state.
-  Authority-Driven Transitions:  Authorities can only interact with reports in
the Open, Reopened, or In Progress states.  An authority calling startWork()
shifts an Open or Reopened issue to the In Progress state, providing trans-
parency  to  citizens  that  action  is  underway.   From  the  In  Progress  state,

## 42
calling markAsSolved() shifts the report to Pending Verification.  Addition-
ally,  calling  rejectIssue()  from  the  Open  or  In  Progress  states  shifts  it  to
## Pending Rejection Review.
-  Consensus Verification:  The FSM mandates that authority actions are never
final  until  verified  by  the  community.   If  an  authority  marks  an  issue  as
solved, the community must vote to verify the physical fix.  Achieving the
verification threshold transitions the report to the terminal Closed state.  If
the community rejects the fix, the state transitions to Reopened, forcing the
authority to address the issue again.
3.2.3    Identity and Access Control Implementation
To satisfy the project’s requirement for privacy-preserving accountability, an iden-
tity  decoupling  mechanism  was  successfully  developed.   This  subsystem  ensures
that citizens can interact with the blockchain anonymously while remaining veri-
fied by an off-chain authority.  The implementation was structured into three main
components
  GovID Simulator:  An off-chain simulated identity server was developed and
deployed to a personal Virtual Private Server (Virtual Private Server (VPS)).
This service acts as the trusted authority for verifying real-world identities.
A  dedicated  API  endpoint  (/api/govid/verify-citizen)  was  implemented  to
securely authenticate users via their National Identity Number (govId) and
a  password,  bridging  the  gap  between  traditional  web  authentication  and
decentralized access.
  Citizen  Keypair  generation:  To  completely  decouple  a  user’s  real  identity
from their on-chain footprint, the identity server does not store or transmit
blockchain addresses.  Instead,  upon successful authentication,  the simula-
tor generates and returns a secure, 256-bit citizenSeed.  This cryptographic
seed is then used by the client-side DApp to deterministically generate an
anonymous public-private keypair, allowing the citizen to interact securely
with smart contracts without exposing personal data.
  Ticket  Batch  Generation:  To  facilitate  multiple  secure,  anonymous  report
submissions over time, the simulator implements a batch authorization pro-
tocol.  During authentication, the server generates a structured ticketBatch
(currently configured to issue 10 tickets per request).  Each ticket contains a
unique ticketId (a cryptographic hash) and a signature signed by the Identity
Authority’s  private  key.   Citizens  use  these  single-use  tickets  to  authorize
their  transactions  on-chain.   The  backend  relayer  validates  the  authority’s

## 43
signature on the ticket, granting access without ever knowing which specific
citizen is submitting the report.
## 3.2.4    Backend Relayer Implementation
The backend relayer serves as a critical middleware component that bridges the
frontend DApp with the blockchain network and external services.  It is responsible
for  handling  report  submissions,  managing  interactions  with  IPFS  for  off-chain
storage, and orchestrating AI-based content moderation before anchoring data on
the blockchain.
The implementation utilizes the NestJS framework to provide a robust and highly
modular  RESTful  API.  The  core  workflow  of  the  relayer  executes  the  following
deterministic pipeline for each incoming citizen report.
Figure 3.10:  Backend relayer workflow architecture.

## 44
-  Cryptographic  Verification:  The  relayer  receives  the  payload  via  a  POST
/report endpoint.  Utilizing the ethers.js library,  it performs a strict dual-
signature validation:
(a)  It  verifies  the  ZKP  Govid  Simulator  ticket  signature  against  the  dy-
namically fetched Government Authority public key to ensure the user
is an authorized citizen.
(b)  It reconstructs the payload hash (binding the description and ticket ID)
and verifies the citizen’s signature to prevent data tampering in transit.
-  AI Content Moderation:  To prevent on-chain spam,  toxic immutability of
blockchains and ensure platform integrity, the relayer routes the submitted
text and media to the AI Oracle moderation service.  This service acts as an
automated filter, analyzing the content for appropriateness and returning a
validation verdict before any storage operations occur.
-  Decentralized Storage (IPFS): To maintain a highly efficient and cost-effective
blockchain state,  heavy multimedia files and detailed text are offloaded to
IPFS. The relayer manages the file buffers via multer, processes the upload,
and retrieves an immutable CID.
-  Gasless Blockchain Submission: As the final step, the relayer formats a trans-
action  containing  the  IPFS  CID  and  the  ZKP  ticket  (which  serves  as  a
Sybil-resistant  submissionNullifier).   The  relayer  signs  and  dispatches  this
transaction to the Reporting.sol smart contract.  By paying the network gas
fees from its own wallet, the relayer enables a completely frictionless, gasless
experience for the end-user.
3.2.5    IPFS Off-chain Storage Integration
The  system  employs  IPFS  as  the  off-chain  storage  layer  to  manage  large  data
objects, including citizen-submitted report images and structured report metadata.
Rather than recording full file content on the blockchain, only the CID produced by
IPFS is stored on-chain.  The CID is a cryptographic hash uniquely representing
the  exact  content  of  a  file,  such  that  any  modification  to  the  file  produces  an
entirely different CID. This content-addressing mechanism ensures tamper-evident
storage while significantly reducing on-chain data overhead and improving overall
system scalability.
To demonstrate the decentralized nature of IPFS within the prototype environ-
ment, three IPFS nodes are deployed across three separate machines and connected
as peers within a private controlled network.  When a file is uploaded and pinned
on the primary node, the two peer nodes retrieve and independently pin the same

## 45
content, ensuring redundant availability across all three machines.  This peer net-
work operates entirely within the controlled laboratory environment and does not
connect to the public IPFS network, which is consistent with the defined project
scope.
The off-chain storage integration is implemented as a dedicated backend service
positioned between the DApp frontend and the IPFS node cluster, structured using
a layered architecture of route definitions, controller components, utility modules,
and middleware layers.  A content moderation step is executed before any file is
committed to IPFS storage, where every submission passes through an AI-assisted
moderation module and only approved content is uploaded and assigned a CID. At
the current stage of development, the moderation module has been integrated into
the service architecture and is prepared to connect to the AI moderation service
once that component is completed.
The upload workflow follows a two-stage sequence. In the first stage, the submitted
image passes through moderation, is uploaded to the primary IPFS node, pinned
across  peer  nodes,  and  its  CID  is  returned.   In  the  second  stage,  the  complete
report metadata comprising the title,  description,  category,  geographic location,
pseudonymous reporter identifier, and the image CID is packaged as a structured
JSON object and uploaded to IPFS, producing a metadata CID. The DApp then
forwards  only  this  metadata  CID  to  the  smart  contract,  which  records  it  per-
manently on the blockchain as an immutable on-chain anchor.  During retrieval,
the metadata CID is read from the blockchain and used to fetch the full report
data  from  IPFS,  with  the  embedded  image  CID  used  separately  to  retrieve  the
associated image.
The system further incorporates a CID verification mechanism to confirm that a
CID is resolvable before it is submitted to the blockchain, and a pin management
mechanism  to  handle  content  removal  where  necessary.   Removing  a  pin  from
the  local  nodes  allows  garbage  collection  to  reclaim  storage  while  the  on-chain
CID record is preserved as an immutable audit trail, directly addressing the toxic
immutability challenge identified in the literature.
3.2.6    AI-based Moderation System Implementation
The  AI  moderation  subsystem  is  designed  as  an  off-chain  oracle  network.   The
moderation process is performed off-chain and the result is returened to the re-
porting workflow.  The oracle network consists of three independent oracle workers
and one aggregator.  The aggregator forwards the moderation request to all oracle
workers, collects their decisions, applies a voting rule, signs the final decision, and
returns the result to the relayer.  This architecture is demonstrated in Figure 3.11.
The oracle 1 focuses on detecting toxic, abusive, threaening, or harmful language.
It analyzes the submitted report using a predefined moderation strategy and re-

## 46
Figure 3.11:  Oracle network architecture for AI moderation.

## 47
turns a vote.  The oracle 2 focuses on spam detection.  It checks for promotional
content, repeated characters, and extremely short descriptions.  The third oracle
focuses  on  civic  relevance.   It  checks  whether  the  report  is  related  to  local  gov-
ernance issues such as roads, garbage, water, drainage, public infrastructure, and
community facilities.
The oracle aggregator combines the decisions of the three oracle workers.  Each
oracle returns either ACCEPT or REJECT. The current aggregation logic uses a
two out of three (2/3) majority rule.  The final moderation result includes the final
decision, confidence score, report hash, oracle votes, decision hash, and aggregator
signature.
To ensure integrity of the moderation results, several mechanisms are used.  The
aggregator computes a hash of the submitted report payload. The final moderation
result and oracle votes are combined and hashed to crate the decision hash.  Also,
the aggregator sign the decision hash using its private key.
3.2.7    Web-based DApp Development
The decentralized application (DApp) serves as the primary gateway for citizens
to  interact  with  the  local  governance  system.   It  is  built  using  a  modern  web
stack comprising Next.js and React for the frontend interface, Tailwind CSS for
responsive styling, and Ethers.js for cryptographic operations.  The architecture is
designed to abstract blockchain complexities away from the end-user while main-
taining strict privacy and security guarantees.
## User Authentication Interface
The authentication interface is designed to verify citizen eligibility without com-
promising personal privacy.
  GovID Verification Integration:  The interface securely collects the cit-
izen’s GovID credentials and interfaces with an external GovID Simulator
API.  This  abstracts  the  process  of  verifying  a  citizen’s  real-world  identity
against a centralized registry.
  Cryptographic Credential Generation:  Upon successful identity verifi-
cation, the system retrieves a batch of ZKP tickets and a unique ‘citizenSeed‘.
  Local State Management: Using the ‘ethers.js‘ library, a localized Citizen
Wallet is derived from the seed.  A custom React Context (CitizenContext)
is utilized to manage the session state, ensuring that the generated private
keys and ZKP tickets remain strictly on the client-side device and are never
exposed to external servers.  The UI incorporates dynamic feedback mecha-
nisms to indicate the generation of cryptographic proofs to the user.

## 48
## Report Submission Interface
The report submission module allows authenticated citizens to report civic issues
anonymously.
  Form  Design  and  Data  Handling:  Developed  with  a  mobile-first  ap-
proach, the form captures issue descriptions and optional photographic evi-
dence using standard FormData structures to support multipart uploads.
  Anonymous Cryptographic Signing:  To guarantee anonymity and pre-
vent spam,  each submission consumes a single ZKP ticket from the user’s
allocated  batch.   The  payload  (consisting  of  the  issue  description  and  the
ZKP ticket ID) is hashed using Keccak-256 and subsequently signed using
the citizen’s locally stored ECDSA private key.
  Meta-Transaction Relaying:  Instead of submitting transactions directly
to the blockchain and incurring gas fees, the frontend dispatches the signed
payload,  image,  and  ZKP  metadata  to  a  NestJS  Backend  Relayer.   The
relayer handles the intermediate steps:  uploading the evidence to IPFS, re-
questing AI moderation, and finally submitting the transaction to the Geth
blockchain network on behalf of the user.
## Blockchain Query Interface
The query interface acts as a community feed where citizens can view, filter, and
track the status of reported issues.
  Mobile-First Feed Architecture:  Implemented as a single-column, scrol-
lable interface inspired by modern social media platforms (e.g., Reddit). This
design choice prioritizes readability and user engagement on mobile devices.
  Dynamic Issue Cards:  Data retrieved from the blockchain is formatted
into interactive cards.  Each card displays critical metadata including cate-
gorical status badges (e.g., PENDING VALIDATION, OPEN, RESOLVED),
community upvotes, truncated descriptions, timestamps, and image thumb-
nails.
  State Management and Navigation:  The interface employs React state
hooks to allow real-time filtering of issues by category (e.g., Infrastructure,
Parks  &  Rec,  Safety).   Furthermore,  a  persistent  Floating  Action  Button
(FAB) is implemented to provide users with seamless access to the report
submission workflow at any time.

## 49
## Chapter 4
Testing, Experimentation, and
## Validation
This chapter outlines the proposed methodology for the testing, experimentation,
and  validation  of  the  decentralized  reporting  framework.   Given  the  distributed
nature of the system—which integrates off-chain cryptographic services, AI mod-
eration, and on-chain smart contracts—a rigorous experimental setup will be es-
tablished to evaluate performance, security, and functional correctness.
## 4.1    Experimental Setup
To  accurately  simulate  a  real-world  deployment  of  the  permissioned  blockchain
and its ancillary microservices, the experimental environment has been hosted on
a cloud-based infrastructure utilizing containerization technologies.
## 4.1.1    Hardware Infrastructure
The testing environment was deployed across two identical VPS instances to sim-
ulate a distributed network architecture and evaluate inter-service communication
latency.  The hardware specifications for each VPS are as follows:
-  Compute:  4 vCPU Cores
-  Memory:  8 GB RAM
-  Storage:  75 GB SSD
-  Network:  High-bandwidth cloud uplink
Server 1 acts as the primary operational node, hosting the core citizen-facing ap-
plications, middleware, and the blockchain ledger.  Server 2 is strictly dedicated to

## 50
hosting the computationally intensive AI moderation ensemble and the IPFS stor-
age layer.  This isolation prevents resource monopolization and ensures accurate
performance profiling of the blockchain consensus mechanism.
4.1.2    Software and Deployment Environment
To ensure reproducibility and consistency across test iterations, the entire software
stack was containerized using Docker.
-  Orchestration and CI/CD: Deployment and lifecycle management of the con-
tainers are handled by Dokploy, a self-hosted Platform-as-a-Service (PaaS)
solution installed on both servers.
-  Automated  Deployment:  Continuous  Integration  and  Continuous  Deploy-
ment  (CI/CD)  pipelines  were  established  via  GitHub  webhooks.   Dokploy
was configured to monitor the develop branch of the project repository. Upon
receiving a trigger, it automatically pulls the latest source code, builds the
respective  Dockerfiles  for  the  microservices,  and  deploys  the  updated  con-
tainers.
4.1.3    Blockchain Configuration (Server 1)
The on-chain environment consists of a private, permissioned PoA blockchain.
-  Client  Software:   The  network  was  initialized  using  Go-Ethereum  (Geth)
version 1.13.15.
-  Consensus  Engine:   The  Clique  PoA  consensus  algorithm  was  utilized  to
ensure deterministic block times and eliminate the computational overhead
of PoW, which closely aligns with the operational model of a government-
backed consortium chain.
-  Node Topology: A 3-node cluster was deployed via a unified docker-compose.yml
configuration.  These nodes serve as the designated Authority (Sealer) nodes
representing various governance entities.
4.1.4    Application and Services Topology
The testing setup evaluates the interaction between the following primary subsys-
tems distributed across the two servers.
Deployed on Server 1 (Core Operations):

## 51
-  ZKP-GovID Simulator: A Node.js service simulating the issuance of government-
backed ZKP tickets.
-  Frontend DApp:  A Next.js application providing the citizen interface.
-  Backend Relayer: A NestJS-based middleware component responsible for off-
chain cryptographic validation, routing, and gasless blockchain transaction
submission.
-  Smart  Contracts:   Compiled  using  the  Hardhat  development  environment
utilizing Solidity version 0.8.20.
Deployed on Server 2 (Storage and AI Oracle):
-  AI Moderation Ensemble:  A multi-node AI oracle architecture designed for
robust spam and content filtering.  This consists of three distinct AI algo-
rithm nodes running concurrently to analyze incoming media and text. These
nodes are governed by a central Aggregator Node that acts as the single en-
try point and determines the final moderation verdict based on algorithmic
consensus.
-  IPFS Node:  A dedicated IPFS node that will be deployed in the subsequent
testing phase to handle the distributed, off-chain storage of all civic report
multimedia (images) and heavy metadata, returning immutable CIDs to the
backend relayer.
## 4.2    Testing Methodology
To ensure the reliability, security, and performance of the decentralized reporting
framework, a comprehensive, multi-tiered testing methodology will be employed.
This approach systematically validates the architecture from isolated components
up to the complete end-to-end user workflow.
## 4.2.1    Subsystem Testing
Subsystem testing will focus on isolating individual architectural components to
verify their internal logic, cryptographic integrity, and algorithmic correctness prior
to network integration.
-  Smart Contract Validation:  The core reporting smart contract will undergo
rigorous unit testing using the Hardhat development framework.  Automated
tests  will  be  written  to  validate  the  logic  of  the  FSM,  ensuring  that  com-
munity voting thresholds trigger correct status changes and that role-based
access controls prevent unauthorized authority actions.

## 52
-  Backend Relayer Verification:  The middleware will be tested using a dedi-
cated testing suite.  The primary focus will be validating the cryptographic
verification algorithms, ensuring that both the ZKP tickets from the simula-
tor and the citizen signatures are correctly authenticated or systematically
rejected when malformed.
-  AI Oracle Evaluation: The AI moderation ensemble will be tested in isolation
using a curated dataset of synthetic civic reports.  This dataset will include
a  mixture  of  valid  public  issues,  explicit  spam,  and  manipulated  imagery
to  evaluate  the  accuracy,  false-positive  rate,  and  consensus  latency  of  the
multi-node aggregator.
## 4.2.2    Integration Testing
Once  individual  subsystems  are  validated,  integration  testing  will  be  conducted
to evaluate the communication interfaces, network latency, and data flow between
the distributed microservices across the two virtual private servers.
-  Relayer and Off-Chain Services:  Tests will verify the backend relayer’s abil-
ity  to  seamlessly  orchestrate  the  initial  validation  pipeline.   This  includes
measuring the successful routing of payloads to the AI Oracle ensemble, the
handling of timeout exceptions, and the successful uploading of multimedia
to the IPFS node to retrieve immutable CIDs.
-  Relayer and Blockchain Interface: Integration scripts will simulate the relayer
dispatching transactions to the private PoA blockchain network.  This phase
will verify the gasless submission mechanics, ensuring the relayer accurately
wraps the CIDs and ticket nullifiers into valid transactions that are accepted
by the network nodes.
-  Frontend to Middleware Communication:  API integration tests will confirm
that the decentralized application securely formats and transmits the cryp-
tographic  payloads,  including  the  user  description  and  attached  media,  to
the relayer over encrypted channels.
## 4.2.3    Functional Testing
Functional testing will evaluate the entire integrated system against the defined
operational requirements from an end-user perspective, simulating both real-world
usage and adversarial conditions.

## 53
-  End-to-End User Journeys:  Automated scripts will simulate complete, valid
report lifecycles.  This entails a simulated citizen generating a ticket, submit-
ting a valid issue via the frontend, passing AI moderation, anchoring on the
blockchain, and successfully progressing through the community validation
and authority resolution states.
-  Sybil Resistance and Replay Attack Mitigation:  The framework will be sub-
jected to adversarial functional tests.  Scripts will intentionally attempt to
submit  multiple  reports  using  identical  ticket  nullifiers  to  verify  that  the
smart contract successfully rejects duplicate entries and maintains the one-
ticket-one-vote invariant.
-  Cryptographic  Forgery  Attempts:   The  system  will  be  tested  by  injecting
payloads with manipulated descriptions or mismatched signatures.  This will
ensure  the  backend  relayer  systematically  drops  tampered  requests  before
they can interact with the off-chain storage or consume blockchain resources.
## 4.2.4    Blockchain Performance Testing
To quantitatively evaluate the viability and scalability of the proposed decentral-
ized reporting framework, a series of performance benchmarking experiments will
be conducted on the 3-node Proof-of-Authority network.  These stress tests will
be executed using automated benchmarking tools, such as Hyperledger Caliper or
custom Node.js scripting, to simulate concurrent user interactions.  The evaluation
will focus on three primary Key Performance Indicators as transaction throughput,
transaction latency, and block confirmation times.
## Transaction Throughput Testing
The throughput experiment will measure the maximum capacity of the blockchain
network to process high volumes of simultaneous civic reports.
-  Experiment Design: The testing suite will generate a progressively increasing
load  of  concurrent  report  submissions  and  voting  transactions  sent  to  the
backend relayer.  This mimics a real-world scenario of mass reporting during
a localized civic emergency, such as a natural disaster.
-  Significance:   High  throughput  is  essential  to  prevent  network  congestion,
avoid  memory  pool  overflows,  and  ensure  the  relayer  does  not  become  a
bottleneck during peak usage.

## 54
-  Metrics  and  Parameters:  The  primary  metric  is  Transactions  Per  Second,
calculated by dividing the total number of successfully committed transac-
tions by the total duration of the stress test.  Secondary parameters include
the transaction success-to-failure ratio and the CPU utilization on Server 1.
-  Thresholds  and  State-of-the-Art  Comparison:  Public  mainnet  blockchains
like Ethereum traditionally process between 15 and 30 Transactions Per Sec-
ond.  The benchmark for this permissioned Proof-of-Authority configuration
is set at a minimum threshold of 100 Transactions Per Second.  Achieving
this will demonstrate a highly scalable environment that significantly out-
performs traditional public ledgers for civic applications.
## Transaction Latency Testing
The latency experiments will evaluate the responsiveness of the reporting system
from the perspective of the backend relayer and the end-user.
-  Experiment Design:  High-precision timestamps will be recorded at the exact
moment the relayer dispatches the signed transaction to the blockchain and
compared against the timestamp of the finalized block that incorporates that
specific transaction.
-  Significance:  Low  transaction  latency  ensures  a  seamless  user  experience.
Extended delays could lead to timeout errors within the middleware interface
and cause desynchronization between the off-chain IPFS storage and the on-
chain smart contract state.
-  Metrics  and  Parameters:  The  core  metrics  evaluated  will  be  the  Average
Transaction Latency measured in seconds,  and the 95th percentile latency
to account for network outliers under heavy load conditions.
-  Thresholds and State-of-the-Art Comparison:  While public Proof-of-Stake
networks  currently  target  latency  periods  of  12  seconds  or  more,  the  con-
figured  Proof-of-Authority  consensus  mechanism  eliminates  complex  cryp-
tographic puzzles.  The expected benchmark for this project is an average
latency of under 5 seconds per transaction, representing a substantial opti-
mization over standard public blockchain networks.
Block Confirmation and Finality Testing
This phase of testing will analyze the deterministic nature of the Clique consensus
engine across the three designated authority nodes.

## 55
-  Experiment  Design:   Network  monitoring  tools  will  track  the  block  prop-
agation  times  across  the  node  topology  and  measure  the  block  generation
intervals during both idle periods and extreme stress-testing phases.
-  Significance:  Rapid and deterministic block confirmation is critical for the
FSM  implemented  in  the  reporting  contract.   It  ensures  that  community
votes  and  authority  state  transitions  are  registered  instantly  without  the
risk of chain reorganizations, forks, or orphaned blocks.
-  Metrics and Parameters:  The primary parameters are Average Block Time
measured  in  seconds  and  Time  to  Finality,  which  measures  the  duration
required for a transaction to become mathematically irreversible.
-  Thresholds and State-of-the-Art Comparison: Traditional probabilistic final-
ity in legacy networks can take minutes to resolve.  For this 3-node Proof-
of-Authority setup, the block time parameter is explicitly configured in the
genesis block to a fixed interval of 5 seconds.  Consequently, the benchmark
for absolute finality is expected to be achieved within 1 to 2 blocks, or 5 to 10
seconds.  This matches the state-of-the-art performance observed in modern
enterprise consortium blockchains.
## 4.2.5    Smart Contract Validation
To ensure the logical correctness, security, and gas efficiency of the decentralized
reporting  framework,  a  comprehensive  validation  suite  will  be  executed  against
the core Solidity smart contract.  This testing phase will utilize the Hardhat devel-
opment environment paired with the Chai assertion library to simulate complex
on-chain interactions.  The validation process is categorized into three critical do-
mains as ticket validation, report creation logic, and state transition integrity.
Ticket Validation and Sybil Resistance
This phase will empirically test the cryptographic nullifier tracking system to en-
sure the network is impervious to Sybil attacks and duplicate reporting.
-  Experiment Design:  Automated test scripts will simulate the submission of
civic reports using valid, backend-signed ZKP tickets.  Immediately following
a successful submission, the script will intentionally attempt a replay attack
by  submitting  a  secondary  report  utilizing  the  exact  same  ticket  nullifier.
Additional tests will attempt to inject malformed or mathematically invalid
nullifier hashes.

## 56
-  Significance:  Validating  the  nullifier  mapping  is  critical  to  preserving  the
one-citizen-one-vote invariant.  If a malicious actor could bypass this check,
they could artificially inflate the severity of an issue or spam the government
authority with duplicate tasks.
-  Metrics and Parameters:  The primary metric evaluated will be the Trans-
action Revert Rate under adversarial conditions, alongside the specific Gas
Cost required to execute the nullifier validation logic.
-  Thresholds and Benchmarks:  The acceptable benchmark for this mechanism
is a strict 100 percent transaction revert rate for all duplicate or malformed
ticket submissions.  Furthermore, the gas overhead for checking the nullifier
mapping must remain highly optimized to ensure the relayer is not subjected
to excessive network fees.
Report Creation and Access Control
These experiments will validate the initialization of civic issues on the blockchain,
ensuring that data is stored efficiently and that only authorized entities can write
to the ledger.
-  Experiment  Design:   The  test  suite  will  generate  transactions  attempting
to  call  the  report  creation  function  from  various  network  addresses.   One
address will be properly provisioned with the Relayer Role, while the others
will represent unauthorized standard user wallets.  The test will verify that
only the relayer can anchor the IPFS CID and initial voting metadata to the
chain.
-  Significance:  This verifies the Separation of Concerns architecture, ensuring
the smart contract acts exclusively as a secure state machine rather than a
vulnerable, open-access database.
-  Metrics and Parameters:  The parameters assessed include RBAC execution
accuracy and the Initial State Mapping accuracy.  The computational cost
will be measured in total execution gas.
-  Thresholds and Benchmarks:  Any creation attempt by an address lacking
the designated relayer permissions must revert immediately.
State Transition and FSM Logic
The most rigorous testing phase will evaluate the strict 8-stage lifecycle of a civic
report to guarantee that government authorities and citizens interact within pre-
defined boundaries.

## 57
-  Experiment  Design:   A  simulated  environment  will  recreate  the  complete
lifecycle of multiple reports.  Tests will incrementally cast community votes
to  verify  that  an  issue  automatically  transitions  from  Pending  Validation
to Open upon reaching the required mathematical threshold.  Subsequently,
simulated authority nodes will invoke state-changing functions such as start-
ing work,  marking as solved,  or rejecting the issue.  Finally,  the suite will
attempt  unauthorized  state  bypasses,  such  as  an  authority  attempting  to
manually force an issue into the Closed state without the mandatory com-
munity Pending Verification phase.
-  Significance:  The FSM is the core accountability mechanism of the project.
Validating this logic ensures that authorities cannot unilaterally dismiss pub-
lic issues and that community consensus dictates the final resolution of every
report.
-  Metrics and Parameters:  The primary metric is Code Coverage, specifically
targeting  statement,  branch,  and  function  coverage  within  the  smart  con-
tract.  Secondary metrics include State Transition Accuracy under edge-case
voting scenarios.
-  Thresholds and Benchmarks:  The testing benchmark mandates 100 percent
branch and statement coverage for all state transition functions.  The system
must  yield  zero  successful  unauthorized  state  bypasses,  enforcing  absolute
adherence to the 8-stage consensus lifecycle.
4.3    AI Moderation Testing
AI moderation testing evaluates whether the moderation subsystem correctly clas-
sifies submitted report content as acceptable or unacceptable. At the current stage,
the implemented AI moderation service focuses mainly on text-based moderation.
Image moderation is planned as a future extension.
The objectives of AI moderation testing are:
-  to verify that the oracle aggregator API is accessible
-  to verify that all three oracle workers respond correctly
-  to test valid civic report acceptance
-  to test spam and abusive content rejection
-  to verify majority voting behavior

## 58
-  to verify generation of report hash, decision hash, and signature
The AI moderation service is deployed on the server 2 using Dokploy and Docker
containers.  The deployment includes:
-  Government Oracle container
-  International Oracle container
-  NGO Oracle container
-  Oracle Aggregator container
The backend relayer communicates only with the aggregator API. The aggregator
communicates with the three oracle workers using internal container networking.
4.3.1    API Availability Test
The test cases used for testing moderation API availability are shown in the Table
## 4.1
Table 4.1:  AI moderation API availability tests
Test IDTestExpected ResultStatus
AI-T01Call aggregator health endpointService returns running sta-
tus
## Passed
AI-T02Check oracle worker availabilityAggregator  identifies  avail-
able oracle workers
## Passed
AI-T03Send request without API keyRequest rejectedPassed
AI-T04Send request with valid API keyRequest  processed  success-
fully
## Passed
## 4.3.2    Moderation Classification Tests
The test cases used for testing moderation classification are shown in Table  4.2
## 4.3.3    Oracle Voting Validation
The oracle moderation system uses a three-node voting mechanism.  Each oracle
returns either one of the votes, ACCEPT or REJECT.
The aggregator applies majority-based decision logic.

## 59
Table 4.2:  AI moderation classification tests
Test IDInput TypeExample InputExpected Decision
AI-T05Valid civic report“There is a large pothole near the
public school.”
## ACCEPT
AI-T06Spam content“BUY   NOW   FREE   MONEY
## CLICK HERE.”
## REJECT
AI-T07Toxic contentTextcontainingabusiveor
threatening phrases
## REJECT
AI-T08Empty reportEmpty text fieldReject  request  /  vali-
dation error
Table 4.3:  Oracle voting validation
Oracle VotesExpected Final Decision
## ACCEPT, ACCEPT, ACCEPTACCEPT
## ACCEPT, ACCEPT, REJECTACCEPT
## REJECT, REJECT, ACCEPTREJECT
## REJECT, REJECT, REJECTREJECT
## 4.3.4    Response Structure Validation
Each successful oracle response should include the fields shown in Table 4.4.
Table 4.4:  Oracle aggregator response fields
FieldPurpose
finaldecisionFinal moderation result
finalconfidenceAggregated confidence value
reporthashHash of submitted report payload
decisionhashHash of final moderation decision
oraclevotesIndividual oracle outputs
aggregatorsignatureSignature of decision hash
The presence of reporthash, decisionhash, and aggregatorsignature sup-
ports auditability and tamper-evidence in the moderation process.

## 60
The AI content moderation service was successfully deployed as separate contain-
ers on a VPS. Preliminary API testing confirms that the aggregator can receive
moderation requests, communicate with the oracle workers, collect votes, and re-
turn  an  aggregated  decision.   This  validates  the  feasibility  of  the  decentralized
oracle moderation approach at prototype level.
4.4    IPFS Storage Testing
IPFS serves as the off-chain storage layer of the proposed system.  Since storing
large data such as images and full report metadata directly on the blockchain is
expensive and impractical, the system uploads these files to IPFS and records only
the resulting CID on-chain.  The CID is a cryptographic hash of the file content,
meaning  if  the  file  changes  in  any  way,  the  CID  changes  as  well.   This  design
ensures data integrity without burdening the blockchain with large files.
At the current stage of development, the IPFS service layer has been successfully
implemented and the connection between the service and the local IPFS node has
been established and verified.  A health verification test was conducted to confirm
that  the  IPFS  service  is  running  correctly  and  that  it  communicates  properly
with  the  underlying  IPFS  daemon.   The  test  confirmed  a  healthy  status  along
with  accurate  node  version  information,  establishing  that  the  foundation  of  the
off-chain storage layer is stable and ready for further integration.
However, since the DApp frontend, the AI content moderation module, and the
blockchain layer have not yet been completed, the full testing of the IPFS storage
integration  is  still  in  progress.   The  remaining  testing  activities  will  be  carried
out  progressively  as  the  dependent  components  are  completed.   Upload  perfor-
mance testing will be conducted once the DApp frontend is available to submit
real  citizen  reports  through  the  system.   Files  of  different  sizes,  including  small
JSON metadata objects and larger image files, will be uploaded through the IPFS
service  layer  and  the  time  taken  for  each  upload  will  be  recorded  and  analyzed
to  assess  the  responsiveness  of  the  system  under  realistic  conditions.   Retrieval
integrity  testing  will  be  performed  to  confirm  that  files  downloaded  from  IPFS
remain  identical  to  the  originals.   After  uploading  a  file  and  obtaining  its  CID,
the same file will be retrieved using that CID and compared against the original
content to verify that nothing was lost or altered during storage and retrieval.  CID
validation testing will be carried out to ensure that the generated CID accurately
represents  the  corresponding  file  content.   For  each  uploaded  file,  the  CID  pro-
duced by IPFS will be recorded, and after retrieval, the CID will be recalculated
from the downloaded content and compared against the original value to confirm
that  the  content-addressing  mechanism  functions  correctly.   AI-assisted  content
moderation integration testing will be performed once the moderation service is

## 61
connected  to  the  IPFS  layer.   These  tests  will  verify  that  inappropriate  images
and  text  are  correctly  identified  and  rejected  before  being  permanently  stored,
ensuring that only approved content reaches the IPFS node and subsequently the
blockchain.   End-to-end  integration  testing  between  the  IPFS  storage  layer  and
the deployed smart contracts will be conducted once the blockchain layer is com-
pleted.  These tests will verify that CIDs recorded on-chain correctly resolve back
to their full report metadata and images when fetched through the IPFS retrieval
layer, confirming that the complete off-chain and on-chain data flow operates as
intended.
4.5    End-to-End Integration Testing
To  ensure  the  seamless  operation  of  the  entire  platform,  end-to-end  integration
testing  will  be  conducted  by  simulating  the  complete  lifecycle  of  a  civic  issue
report.   This  testing  phase  will  verify  the  interoperability  between  the  frontend
DApp, the backend relayer, the IPFS storage network, the AI moderation oracle,
and the underlying permissioned blockchain.
The end-to-end testing workflow will be executed as follows:
-  Citizen Authentication and Key Generation:  The test will commence with
a simulated citizen authenticating via the external GovID simulator.  Upon
successful verification,  the system is expected to generate a batch of ZKP
tickets and derive the local wallet, thereby validating the correct functioning
of the identity decoupling mechanism.

## 62
## Figure 4.1:  Citizen Authentication Interfaces
-  Report Submission and Cryptographic Signing:  The authenticated user will
submit a test report containing a text description (e.g.,  “Pothole on Main
Street”)  and  a  sample  image.   The  DApp  will  be  expected  to  consume  a
ZKP ticket, hash the payload, and sign it using the local private key before
transmitting the multipart form data to the backend relayer.

## 63
## Figure 4.2:  Report Submission Form

## 64
-  Off-chain Storage and AI Moderation Routing:  Upon receiving the payload,
the  backend  relayer  will  process  the  submitted  data.   The  visual  evidence
will be routed to the IPFS integration module, and a CID will be generated.
Simultaneously, the text and image data will be evaluated by the AI moder-
ation service to verify that the report is classified as legitimate, non-abusive
content before proceeding to blockchain submission.
-  Blockchain  Recording  via  Meta-Transaction:   Following  AI  approval,  the
backend  relayer  will  format  the  data,  including  the  IPFS  CID,  issue  de-
scription, and the cryptographic proofs.  Then submit a meta-transaction to
the smart contract on the Geth PoA network.  The transaction is expected
to be verified by the validator nodes,  securely anchoring the report to the
immutable ledger without requiring the citizen to pay any gas fees.
-  Frontend Verification:  Finally, the DApp’s query interface will be refreshed
to  retrieve  the  latest  blockchain  state.   The  expected  outcome  is  that  the
newly  submitted  report  will  appear  in  the  community  feed  with  its  corre-
sponding status badge, upvote count, and image thumbnail, confirming that
the entire decentralized pipeline has executed correctly.

## 65
Figure 4.3:  Views of the Submitted Report in the Community Feed

## 66
The successful execution of this simulated workflow will validate the system archi-
tecture and confirm that the individual components interact correctly to provide
a secure, anonymous, and user-friendly civic reporting platform.
4.6    Comparison with Existing Systems
To demonstrate the advantages and novel contributions of the proposed community-
assisted reporting framework, it is essential to compare its architecture and features
against existing solutions in the domain of e-governance and citizen reporting.
## 4.6.1    Centralized Reporting Platforms
Traditional crowdsourced reporting systems,  such as FixMyStreet and SeeClick-
Fix, have successfully established user-friendly interfaces with intuitive reporting
workflows and clear feedback loops.  However, as identified in the literature, these
platforms rely entirely on centralized server architectures.  This centralization cre-
ates single points of failure and makes the systems susceptible to data tampering
and unauthorized modifications.  Furthermore, centralized platforms often require
mandatory  identity  disclosure,  which  can  discourage  citizen  participation,  espe-
cially when reporting sensitive issues or criticizing local authorities.  In contrast,
the proposed system leverages a permissioned blockchain to ensure data immutabil-
ity and absolute transparency.  By employing ZKP and identity decoupling,  the
proposed framework guarantees citizen anonymity while maintaining mathemati-
cal accountability, a feature completely absent in conventional centralized systems.
## 4.6.2    Traditional Content Moderation
Existing  governance  platforms  typically  rely  on  manual  content  moderation  by
human administrators to filter out spam or abusive content.  While effective for
small-scale  operations,  manual  moderation  introduces  significant  transaction  la-
tency,  high  operational  costs,  and  the  potential  for  human  bias.   Most  impor-
tantly, it reintroduces centralized control over what public information is allowed
to be published.  The proposed system addresses these limitations by integrating
an AI-based off-chain moderation oracle.  By automating the filtering of textual
and visual content using machine learning models before the data is permanently
recorded on-chain, the system achieves scalable, unbiased, and rapid moderation
while preserving the decentralized ethos of the platform.

## 67
## 4.6.3    Public Blockchain Approaches
While  some  theoretical  governance  models  propose  using  public,  permissionless
blockchains  (such  as  the  Ethereum  mainnet)  to  achieve  maximum  decentraliza-
tion,  these architectures are poorly suited for frequent local governance interac-
tions.   Public  blockchains  suffer  from  high  transaction  latency,  limited  through-
put, and unpredictable, fluctuating gas fees that the user must pay.  The proposed
framework overcomes these usability challenges by utilizing a private, permissioned
blockchain running a PoA consensus mechanism.  This architecture provides pre-
dictable, high-performance transaction processing.  Additionally, it eliminates the
financial burden on citizens through the use of a backend relayer network (meta-
transactions), offering a seamless, ”gasless” experience.
4.6.4    Domain-Specific Blockchain Solutions
Recent literature highlights several blockchain-based complaint management sys-
tems,  but  these  are  primarily  tailored  for  highly  specific  domains  such  as  law
enforcement  (e.g.,  police  complaint  registries).   These  systems  often  focus  nar-
rowly on administrative efficiency, restrict access entirely to authorized personnel,
and  frequently  lack  robust  mechanisms  for  handling  large  multimedia  evidence.
Unlike these isolated solutions, the proposed framework introduces a generalized,
community-assisted approach.  It actively encourages public participation through
opinion polling and community upvoting.  Furthermore, it efficiently manages large
multimedia files (e.g., images of infrastructure damage) through decentralized off-
chain storage via IPFS, seamlessly linking cryptographic hashes back to the im-
mutable blockchain ledger.

## 68
## Chapter 5
## Discussion
This  chapter  discusses  the  main  findings,  important  design  decisions,  current
progress, and limitations of the proposed system.
5.1    Novel Contributions of the Project
The main contribution of this project is the design of a privacy-preserving citizen
reporting  system  for  local  governance.   The  system  combines  blockchain,  smart
contracts, IPFS, AI-based moderation, and a web-based DApp into one framework.
A key design decision is the separation of real citizen identity from on-chain report
records.   Citizens  are  first  verified  through  the  simulated  GovID  service.   After
verification,  the  system  uses  ticket  IDs  and  pseudonymous  key  pairs  for  report
submission.   This  helps  citizens  report  public  issues  without  directly  exposing
their identity on the blockchain.
Another important contribution is the use of a backend relayer.  The relayer sub-
mits blockchain transactions on behalf of citizens.  This improves usability because
citizens do not need to manage gas fees or directly interact with blockchain nodes.
The system also uses IPFS for off-chain storage.  Images and larger report content
are stored outside the blockchain, while only CIDs and hashes are stored on-chain.
This reduces blockchain storage overhead while preserving data integrity.
AI-assisted moderation is used before reports are stored permanently.  This helps
reduce  spam,  abusive  content,  and  irrelevant  submissions.   The  moderation  ser-
vice is designed using multiple oracle workers and an aggregator,  which reduces
dependence on a single moderation node.
## 5.2    Overall System Validity
The current system design supports the main objectives of the project.  The per-
missioned blockchain provides a tamper-evident record of report metadata.  Smart

## 69
contracts provide the base for report creation, state tracking, and future govern-
ment actions.
The identity mechanism supports privacy by separating real identity verification
from  blockchain  activity.   The  DApp  improves  accessibility  by  giving  citizens  a
simple interface for report submission.  The relayer hides blockchain complexity
from users.
The AI oracle service has been deployed as a containerized service on a VPS. This
shows that off-chain moderation can be integrated with the reporting workflow.
IPFS is planned to handle media and report content storage.
At  this  progress  stage,  the  system  is  valid  as  a  proof-of-concept.   However,  full
validation requires complete integration between the DApp, relayer, IPFS, smart
contracts, and blockchain.
5.3    Achievement of Proposed Objectives
The project has made progress toward the proposed objectives.
The  first  objective  was  to  design  a  permissioned  blockchain  using  PoA  consen-
sus.  The architecture has been designed around a private Ethereum-compatible
blockchain.  This supports integrity and controlled participation.
The  second  objective  was  to  use  smart  contracts  for  reporting  workflows.   The
smart  contract  design  includes  report  creation,  status  management,  and  event
handling.  Government-side actions are still under development.
The  third  objective  was  to  develop  user-friendly  interfaces.   The  citizen-facing
DApp  interfaces  for  login  and  report  submission  have  been  developed.   Further
work is needed for government-side interfaces.
The  fourth  objective  was  to  integrate  AI-based  moderation.   A  text-based  AI
oracle moderation service has been implemented and deployed.  Image moderation
is planned as a future extension.
Overall,  the  project  has  achieved  good  progress  at  subsystem  level.   The  next
important task is full end-to-end integration.
5.4    Summary of Results and Observations
Several observations were made during the current progress stage.
First,  the  modular  architecture  helped  the  team  develop  different  parts  of  the
system in parallel. Each component can be tested separately before full integration.
Second, the hybrid storage approach is necessary.  Blockchain is suitable for meta-
data and audit trails, but not for large files.  Therefore, IPFS is required for storing
media and report content.

## 70
Third, the relayer is important for usability.  It allows citizens to use the system
without understanding blockchain transactions or gas fees.
Fourth, AI moderation should happen before IPFS upload and blockchain submis-
sion.  This reduces the risk of storing harmful or irrelevant content permanently.
Finally, containerized deployment improved service isolation and deployment con-
sistency, especially for the oracle subsystem.
## 5.5    Real-world Applicability
The  proposed  system  can  be  useful  for  local  governments  where  citizens  report
issues such as road damage, garbage disposal, drainage problems, broken street-
lights, and flooding.
In a real-world scenario,  a citizen can submit a report through the DApp.  The
report  is  verified,  moderated,  stored  off-chain,  and  recorded  on  the  blockchain.
Later, the citizen can check whether the report still exists and track its status.
This can improve trust between citizens and local authorities.  It can also create
an auditable record of how public issues are handled.
5.6    Limitations of the Current Prototype
The current prototype has some limitations.
The  identity  system  is  simulated.   It  does  not  implement  a  complete  real-world
zero-knowledge identity system.
The AI moderation service currently focuses mainly on text moderation.  Image
moderation is not fully implemented yet.
The oracle decentralization is simulated using separate containers.  In a stronger
real-world deployment, oracle nodes should run on separate servers or be operated
by different organizations.
Full end-to-end integration is still in progress.  Some components are implemented
and tested separately, but the complete report submission flow must still be vali-
dated.
The system is also tested only in a controlled environment.  Real-world deployment
would require legal, security, and institutional approval.

## 71
## Chapter 6
Conclusion and Future Work
## 6.1    Conclusion
This project presents a blockchain-based, community-assisted, privacy-preserving
reporting framework for local governance.  The system is designed to address com-
mon  problems  in  centralized  reporting  platforms,  such  as  lack  of  transparency,
weak data integrity, privacy concerns, and unreliable report quality.
The proposed framework combines a permissioned blockchain, smart contracts, a
simulated identity service, a backend relayer, IPFS, AI-assisted moderation, and
a web-based DApp.  Each component has a clear role in the overall system.
The  blockchain  and  smart  contracts  provide  tamper-evident  report  records  and
workflow  management.   The  GovID  simulator  and  ticket-based  mechanism  sup-
port privacy-preserving access control.  The relayer improves usability by handling
blockchain  transactions  on  behalf  of  citizens.   IPFS  supports  scalable  off-chain
storage.  The AI oracle service helps filter spam and inappropriate content before
permanent recording.
At the current progress stage, several important subsystems have been designed
and partially implemented.  The AI moderation subsystem has also been deployed
as separate oracle containers on a VPS. This shows that the proposed architecture
is technically feasible as a prototype.
The main insight from this project is that blockchain alone is not enough for a
practical civic reporting system.  It must be combined with privacy mechanisms,
off-chain storage, moderation, and user-friendly interfaces.
## 6.2    Future Work
The  next  major  task  is  to  complete  full  end-to-end  integration.    The  DApp,
GovID simulator, backend relayer, AI oracle service, IPFS, smart contracts, and
blockchain must work together in one complete report submission flow.

## 72
The  government-side  workflow  should  also  be  completed.   This  includes  report
review, issue assignment, resolution updates, closure, and citizen feedback.
Image moderation should be added to the AI moderation service.  This will allow
the system to check uploaded images for harmful, irrelevant, or misleading content.
The  current  identity  system  should  be  improved  in  future  work.   A  real  zero-
knowledge  proof  or  self-sovereign  identity  mechanism  can  replace  the  simulated
GovID service.
The oracle system can also be improved.  At present, decentralization is simulated
using  separate  containers.   In  future,  oracle  nodes  can  be  deployed  on  separate
servers or operated by different trusted organizations.
More  testing  is  required  after  integration.   This  includes  blockchain  transaction
latency, IPFS upload time, oracle response time, and complete report submission
time.
Security  testing  is  also  required  before  any  real-world  deployment.   Smart  con-
tracts,  APIs,  private keys,  relayer logic,  and deployment infrastructure must be
audited carefully.
Finally, the DApp should be improved through usability testing.  Citizens should
be able to submit and track reports easily without needing blockchain knowledge.
## 6.3    Final Remarks
The proposed system provides a strong foundation for a transparent and privacy-
preserving  local  governance  reporting  platform.   Although  the  prototype  is  still
under development, the current progress shows that the architecture is feasible.
With further integration, testing, and improvement, this framework can support
more  trustworthy  citizen  participation  and  better  accountability  in  local  gover-
nance.

## 73
## Bibliography
[1]  M. Aakunuri, S. S. Kaatha, L. Battini, S. Jangam, and A. Thangella, “De-
centralized complaint management system for law enforcement,” International
Journal of Research Publication and Reviews (IJRPR), vol. 6, no. 6, pp. 9846–
## 9854, 2025.
[2]  R.  Goyal  and  N.  Mittal,  “E-governance  through  blockchain  technology.  a
review,”  in  2021  2nd  Global  Conference  for  Advancement  in  Technology
(GCAT), pp. 1–4, 2021.
[3]  T. Oliveira, M. Campolargo, J. Martins, and F. Cruz-Jesus, “Digital trans-
formation in smart cities:  The role of information and communication tech-
nologies,” Sustainability, vol. 12, no. 9, pp. 1–20, 2020.
[4]  J. Hamill, “Blockchain technology:  Local government applications and chal-
lenges,”  white  paper,  International  City/County  Management  Association
and Government Finance Officers Association, oct 2018.
[5]  Y. Goswami, A. Agrawal, and A. Bhatia, “E-governance:  A tendering frame-
work using blockchain with active participation of citizens,” in 2020 IEEE In-
ternational  Conference  on  Advanced  Networks  and  Telecommunications  Sys-
tems (ANTS), pp. 1–4, IEEE, 2020.
[6]  L. H.  Pratheeba,  D.  R. Bharath,  N.  E.  Cibiya,  S.  Dheekshitha,  and  M. N.
Divya, “Blockchain-based system for effective police complaint management,”
Journal of Emerging Technologies and Innovative Research (JETIR), vol. 10,
no. 6, 2024.  June 2023. Available at https://www.jetir.org.
[7]  “Decision  analytics  using  permissioned  blockchain  “commledger”.”  UND
Scholarly Commons, 2026.  Accessed on January 7, 2026.
[8]  ResearchGate, “A survey on blockchain consensus with a performance com-
parison of pow, pos and pure pos,” ResearchGate, 2020.
[9]  arxiv,  “Performance  modeling  of  public  permissionless  blockchains:  A  sur-
vey,” arXiv preprint arXiv:2402.18049, 2024.

## 74
[10]  ResearchGate, “A survey on blockchain consensus with a performance com-
parison of pow, pos and pure pos,” ResearchGate, 2020.
[11]  “What is proof of authority:  A beginner’s guide.” ZebPay Blog,  2026.  Ac-
cessed on January 7, 2026.
[12]  “Proof  of  authority  blockchain:  Private  lightweight,  fast  consensus.”  Echo,
-  Accessed on January 7, 2026.
[13]  “Proof of authority.” Grokipedia, 2026.  Accessed on January 7, 2026.
[14]  “Beginner’s guide to proof-of-authority (poa).” OneKey, 2026.  Accessed on
## January 7, 2026.
[15]  H. Journals, “The governance technology for blockchain systems:  a survey,”
Frontiers of Computer Science, 2023.
[16]  MDPI, “Unleashing the potential of permissioned blockchain: Addressing pri-
vacy, security, and interoperability concerns in healthcare data management,”
Electronics, vol. 13, no. 24, p. 5050, 2023.
[17]  J.  R.  Andrey  Nechesov,  “Empowering  government  efficiency  through  civic
intelligence,” MDPI, 2023.
[18]  M.  Muneeb,  Z.  Raza,  I.  U.  Haq,  and  O.  Shafiq,  “Smartcon:  A  blockchain-
based  framework  for  smart  contracts  and  transaction  management,”  IEEE
Access, vol. 10, pp. 23687–23699, 2022.
[19]  K. S. Pillai, “Smart contracts offer a toolkit to transform governance,” 2023.
[20]  A. CERTs, “The future of governance:  Will blockchain revolutionize public
administration?,” 2023.
[21]  M. Shuaib, S. Daud, S. Alam, and W. Khan, “Blockchain-based framework
for secure and reliable land registry system,” TELKOMNIKA (Telecommuni-
cation Computing Electronics and Control), vol. 18, pp. 2560–2571, 10 2020.
[22]  U. E. C. Johannes Pandeni Paavo, Rafael Rodriguez-Puentes, “Practicality of
blockchain technology for land registration:  A namibian case study,” MDPI,
## 2023.
[23]  W. Liang, “Scalable blockchain e-voting with off-chain computation and on-
chain verification,” ResearchGate, 2024.

## 75
[24]  H. Baniata and G. Caluna, “Bp-vot:  Blockchain-based e-voting using smart
contracts,  differential  privacy,  and  self-sovereign  identities,”  IEEE  Access,
vol. 13, pp. 46106–46123, 2025.
[25]  N. Dimitri, “Quadratic voting in blockchain governance,” Information, vol. 13,
p. 305, 06 2022.
[26]  P.  N.  M.M.  Ibrahimy,   A.  Norta  and  H.  Nowandish,   “Transforming  e-
participatory  budgeting  with  blockchain:   Boosting  transparency  and  citi-
zen engagement,”  IEEE  Transactions  on  Engineering  Management, vol. 72,
pp. 1376–1403, 2022.
[27]  S. Park, M. Specter, N. Narula, and R. L. Rivest, “Going from bad to worse:
from internet voting to blockchain voting,”  Journal  of  Cybersecurity, vol. 7,
p. tyaa025, 01 2021.
[28]  MDPI, “The development of user-centric design guidelines for web3 applica-
tions:  An empirical study,” 2025.  Accessed on January 8, 2026.
[29]  N. Sonule, “User experience (ux) in web3 and dapps:  Challenges and oppor-
tunities,” 2025.  Accessed on January 8, 2026.
[30]  Ramotion, “Ui/ux design for web 3.0,” 2026.  Accessed on January 8, 2026.
[31]  F. Weekly, “Why usability is the missing layer in crypto finance,” 2025.  Ac-
cessed on January 8, 2026.
[32]  O.  Academic,  “Governance  and  societal  impact  of  blockchain-based  self-
sovereign identities,” 2022.  Accessed on January 8, 2026.
[33]  Fraunhofer, “Conducting a usability evaluation of decentralized identity man-
agement solutions,” 2026.  Accessed on January 8, 2026.
[34]  DZone,  “Blockchain  +  ai  integration:   The  architecture  nobody’s  talking
about,” 2026.  Accessed on January 8, 2026.
[35]  C. V. Marian, D. A. Mitrea, D. S. Rusu, and A. Vasilateanu, “Transparent
digital  governance:   A  blockchain-based  workflow  audit  application,”  2025.
Accessed on January 9, 2026.
[36]  S. F. King and P. Brown, “Fix my street or else:  Using the internet to voice
local public service concerns,” 2012.  Accessed on January 8, 2026.
[37]  mySociety Research, “Fixmystreet!,” 2026.  Accessed on January 9, 2026.

## 76
[38]  O. Adeyeye, “BLOCKCHAIN AND THE FUTURE OF E-GOVERNMENT:
STRATEGIC IMPLICATIONS FOR POLICYMAKERS,” 2025. Accessed on
## January 9, 2026.
[39]  S. Nikonenko, “Blockchain UX explained:  Challenges, trends, and real solu-
tions,” 2025.  Accessed on January 9, 2026.
[40]  A.  Bertrand  and  E.  G.  Consulting,  “How  can  digital  government  connect
citizens without leaving the disconnected behind?,” tech. rep., Ernst & Young
(EY),  June  2023.   EY  Connected  Citizens  Report.  Accessed  on  January  9,
## 2026.
[41]  N. Shahin and L. Ismail, “Towards trustworthy sign language translation sys-
tem:  A  privacy-preserving  edge–cloud–blockchain  approach,”  Mathematics,
vol. 13, no. 23, p. 3759, 2025.  Accessed on January 9, 2026.
[42]  Tencent Cloud, “How can content moderation use blockchain technology?,”
-  Accessed on January 9, 2026.
[43]  M.  A.  Wani,  M.  ElAffendi,  and  K.  A.  Shakil,  “AI-generated  spam  review
detection framework with deep learning algorithms and natural language pro-
cessing,”  Computers,  vol. 13,  no. 10,  p. 264,  2024.  Accessed on January 9,
## 2026.
[44]  G. Gosztonyi, D. Gyetv ́an, and A. Kov ́acs, “Theory and practice of social me-
dia’s content moderation by artificial intelligence in light of european union’s
AI act and digital services act,”  Politics  in  Central  Europe, 2024.  Accessed
on January 9, 2026.
[45]  V.  Kolluri,  T.  R.  Gatla,  and  S.  T.  Boppiniti,  “AI-powered  citizen  science:
Crowd-learning, data verification, and public engagement,” Scientific Endeav-
ours, vol. 1, no. 1, pp. 53–60, 2025.  Accessed on January 9, 2026.
[46]  S. Mohammadi and T. Yasseri, “AI feedback enhances community-based con-
tent  moderation  through  engagement  with  counterarguments,”  October  6
-  arXiv preprint arXiv:2507.08110v3. Accessed on January 9, 2026.
[47]  S.  Goundar  and  I.  Gondal,  “AI-blockchain  integration  for  real-time  cyber-
security:  System design and evaluation,”  Cybersecurity  and  Privacy, vol. 5,
p. 59, August 14 2025.  Accessed on January 9, 2026.
[48]  N.  Kader,  I.  Kang,  and  O.  Seneviratne,  “Enhancing  web  spam  detection
through  a  blockchain-enabled  crowdsourcing  mechanism,”  October  1  2024.
arXiv preprint arXiv:2410.00860v1. Accessed on January 9, 2026.

## 77
[49]  J. Li,  L. Jiang,  H. Liang,  T. Peng,  S. Wang,  and H. Wei,  “Block-CITE: A
blockchain-based crowdsourcing interactive trust evaluation,” Applied System
Innovation, vol. 6, p. 245, October 1 2025.  Accessed on January 9, 2026.
[50]  Kava News, “AI-powered oracles:  Bridging blockchains with smarter data,”
May 29 2024.  Accessed on January 9, 2026.
[51]  K. Zintus-art, B. Vass, and J. Ward, “Empirical evidence in AI oracle devel-
opment,” March 21 2025.  Chainlink Blog. Accessed on January 9, 2026.
[52]  CodeZeros, “AI-powered oracles:  How generative AI is enhancing blockchain
data feeds,” April 10 2025.  Accessed on January 9, 2026.
[53]  M.  Prasad,  “Blockchain  +  AI  in  combating  deepfake  content  circulation,”
Scientific Journal of Artificial Intelligence and Blockchain Technologies, April
-  Accessed on January 9, 2026.
[54]  A. Kumar, “Hybrid moderation models:  Balancing AI and human oversight,”
October 27 2025.  Infosys BPM. Accessed on January 9, 2026.
[55]  B. Kae,  “Research:  AI agent sector overview,”  March 10 2025.  The Block
Research. Accessed on January 9, 2026.
[56]  Chase  Advisors,  “Ai  and  content  moderation,”  tech.  rep.,  Chase  Advisors,
January 2024.  Accessed on January 9, 2026.
[57]  K. Mounika and N. R. Reddy,  “An integrated machine learning framework
for spammer and fake user detection in online social networks,” Fringe Man-
agement, Economics and Politics, 2024.  Accessed on January 9, 2026.