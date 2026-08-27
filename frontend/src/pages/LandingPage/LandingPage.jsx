import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Check, 
  ArrowRight, 
  Database, 
  Shield, 
  Zap, 
  Globe, 
  TrendingUp, 
  Layers, 
  Server, 
  Lock, 
  Cpu, 
  Terminal, 
  Sparkles,
  ShoppingBag,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import styles from "./LandingPage.module.css";

export function LandingPage() {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState("monthly"); // monthly or annual
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Simulator State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorStep, setSimulatorStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Simulator Form State
  const [companyName, setCompanyName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [isSubdomainAvailable, setIsSubdomainAvailable] = useState(null);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  
  // Simulator Console/Deployment State
  const [provisioningProgress, setProvisioningProgress] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const consoleBottomRef = useRef(null);

  // Mockup statistics states for the animated dashboard
  const [mockSales, setMockSales] = useState(1280);
  const [mockStockAlerts, setMockStockAlerts] = useState(2);
  const [lastOrder, setLastOrder] = useState({ id: "#4891", store: "Mercado Livre", val: "R$ 149,90", time: "Agora mesmo" });

  // Pre-configured plans list
  const plans = [
    {
      id: "start",
      name: "Começo Rápido (Start)",
      description: "Ideal para micro-empreendedores que estão iniciando suas operações digitais.",
      priceMonthly: 49.90,
      priceAnnual: 39.90,
      features: [
        "1 Integração de Marketplace",
        "Até 150 produtos cadastrados",
        "Gestão de estoque básica",
        "Relatórios simplificados de vendas",
        "Atualizações diárias de canais",
        "Suporte por e-mail (até 48h)",
        "Instância compartilhada em nuvem"
      ],
      isRecommended: false,
      badge: "Iniciante",
      tenantType: "Cloud Compartilhada"
    },
    {
      id: "growth",
      name: "Crescimento (Growth)",
      description: "Para pequenas e médias empresas em franca expansão que buscam total controle e performance.",
      priceMonthly: 129.90,
      priceAnnual: 99.90,
      features: [
        "3 Integrações de Marketplace",
        "Até 1.500 produtos cadastrados",
        "Gestão de estoque em tempo real",
        "Relatórios gerenciais completos",
        "Atualizações instantâneas via Webhooks",
        "Suporte prioritário via Chat/Zap",
        "Instância Dedicada (Single-Tenant Standard)",
        "Backup diário automático"
      ],
      isRecommended: true,
      badge: "Mais Popular",
      tenantType: "Instância Exclusiva"
    },
    {
      id: "enterprise",
      name: "Escala Dedicada (VIP)",
      description: "A solução corporativa de alta performance para e-commerces com grande volume de transações.",
      priceMonthly: 299.90,
      priceAnnual: 239.90,
      features: [
        "Integrações ilimitadas",
        "Cadastro de produtos ilimitado",
        "Gestão de estoque avançada + Curva ABC",
        "Relatórios com inteligência artificial",
        "Servidor VIP de alta capacidade",
        "Gerente de conta exclusivo",
        "Instância Dedicada VIP (Single-Tenant High-Capacity)",
        "Suporte SLA 24/7 de infraestrutura",
        "Acesso prioritário a novas APIs"
      ],
      isRecommended: false,
      badge: "Alta Performance",
      tenantType: "Infraestrutura VIP"
    }
  ];

  // FAQ list
  const faqs = [
    {
      question: "O que é um sistema Single-Tenant e qual o benefício para minha empresa?",
      answer: "Diferente de sistemas comuns (Multi-Tenant) onde você compartilha o mesmo banco de dados e servidor com milhares de concorrentes, o Controla Fácil oferece uma arquitetura Single-Tenant. Isso significa que, a partir do plano Crescimento, sua empresa ganha um servidor e um banco de dados 100% isolados dos demais. Os benefícios incluem velocidade extrema de carregamento, total segurança de dados (sem risco de vazamento ou cruzamento de informações) e imunidade a lentidões causadas por picos de tráfego de outros clientes."
    },
    {
      question: "Como funciona a integração com marketplaces?",
      answer: "O Controla Fácil conecta-se diretamente com os maiores canais de venda (como Mercado Livre, Shopee, etc.) através de APIs oficiais. Quando um produto é vendido em um canal, o sistema reduz o estoque correspondente no banco de dados e avisa imediatamente as outras plataformas integradas. Isso elimina a dor de cabeça de vender o mesmo produto duas vezes por falta de estoque."
    },
    {
      question: "O processo de contratação simulado realmente cria um sistema?",
      answer: "Como este é um projeto acadêmico de faculdade, a contratação é uma simulação completa de como funcionaria o nosso sistema de provisionamento automatizado em nuvem. Você poderá preencher seus dados, escolher um subdomínio exclusivo e acompanhar a criação animada da infraestrutura na nuvem. Ao finalizar, você receberá dados de acesso de testes para explorar nosso painel interno."
    },
    {
      question: "Posso cancelar minha assinatura simulada ou mudar de plano quando quiser?",
      answer: "Sim! Na nossa simulação, você pode experimentar a implantação de diferentes planos e criar instâncias virtuais com as características de cada um para testar a escalabilidade do sistema."
    },
    {
      question: "Meus dados estarão seguros?",
      answer: "Sim, usamos as melhores práticas de isolamento de rede e criptografia. Na nossa infraestrutura dedicada real, cada cliente conta com barreiras de firewall exclusivas e backups redundantes criptografados em nuvem AWS."
    }
  ];

  // Animated statistics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly change sales slightly
      setMockSales(prev => prev + Math.floor(Math.random() * 3));
      
      // Randomly change last order
      const channels = ["Mercado Livre", "Shopee", "Site Próprio"];
      const prices = ["R$ 89,90", "R$ 159,00", "R$ 310,50", "R$ 49,90", "R$ 219,90"];
      const randomChannel = channels[Math.floor(Math.random() * channels.length)];
      const randomPrice = prices[Math.floor(Math.random() * prices.length)];
      const randomId = `#${Math.floor(1000 + Math.random() * 9000)}`;
      
      setLastOrder({
        id: randomId,
        store: randomChannel,
        val: randomPrice,
        time: "Agora mesmo"
      });
      
      // Toggle stock alert count occasionally
      if (Math.random() > 0.8) {
        setMockStockAlerts(prev => (prev === 2 ? 1 : prev === 1 ? 0 : 2));
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Simulator step-by-step controller
  const handleOpenSimulator = (plan) => {
    setSelectedPlan(plan);
    setCompanyName("");
    setAdminEmail("");
    setAdminPhone("");
    setSubdomain("");
    setIsSubdomainAvailable(null);
    setProvisioningProgress(0);
    setConsoleLogs([]);
    setSimulatorStep(1);
    setIsSimulatorOpen(true);
  };

  const handleNextToSubdomain = (e) => {
    e.preventDefault();
    if (!companyName || !adminEmail || !adminPhone) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    // Auto-generate a subdomain recommendation based on company name
    const recommendedSub = companyName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9]/g, "") // Remove special characters
      .substring(0, 15);
    setSubdomain(recommendedSub);
    setSimulatorStep(2);
  };

  const checkSubdomainAvailability = () => {
    if (!subdomain) return;
    setIsCheckingSubdomain(true);
    setIsSubdomainAvailable(null);
    
    setTimeout(() => {
      setIsCheckingSubdomain(false);
      // Simulates that the subdomain is available (which it always is in our demo)
      setIsSubdomainAvailable(true);
    }, 1200);
  };

  const handleStartProvisioning = () => {
    if (!isSubdomainAvailable) {
      alert("Por favor, verifique e confirme a disponibilidade do subdomínio.");
      return;
    }
    setSimulatorStep(3);
    runDeploymentSimulation();
  };

  // Run simulation logging & progress bar
  const runDeploymentSimulation = () => {
    const logs = [
      { text: "INICIANDO PROVISIONAMENTO DA INSTÂNCIA SINGLE-TENANT...", delay: 200, pct: 5 },
      { text: `Configurando parâmetros para o cliente: ${companyName}`, delay: 800, pct: 10 },
      { text: `Plano selecionado: ${selectedPlan.name} (${selectedPlan.tenantType})`, delay: 1400, pct: 15 },
      { text: "Contatando gerenciador de cluster AWS EKS/EC2...", delay: 2000, pct: 20 },
      { text: "Alocando nó de servidor dedicado na região sa-east-1 (São Paulo)...", delay: 2800, pct: 30 },
      { text: "Servidor virtual alocado e provisionado. ID: i-0fa38c823abf1092e", delay: 3500, pct: 40 },
      { text: "Criando banco de dados PostgreSQL isolado em container Docker...", delay: 4200, pct: 50 },
      { text: "Banco de dados criado. Executando tabelas e relacionamentos...", delay: 5000, pct: 60 },
      { text: "Inserindo cargas de teste e configurações de e-commerce padrão...", delay: 5800, pct: 70 },
      { text: "Construindo container do frontend React pré-configurado...", delay: 6500, pct: 75 },
      { text: `Vinculando rotas de subdomínio: http://${subdomain}.controlafacil.com.br`, delay: 7200, pct: 85 },
      { text: "Gerando certificado SSL Let's Encrypt para tráfego HTTPS seguro...", delay: 8000, pct: 90 },
      { text: "Testando conexões de rede e firewalls dedicados... OK!", delay: 8800, pct: 95 },
      { text: "INSTÂNCIA EXCLUSIVA IMPLANTADA E ATIVADA COM SUCESSO!", delay: 9500, pct: 100 }
    ];

    logs.forEach((log) => {
      setTimeout(() => {
        setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log.text}`]);
        setProvisioningProgress(log.pct);
        
        // Auto scroll console to bottom
        if (consoleBottomRef.current) {
          consoleBottomRef.current.scrollIntoView({ behavior: "smooth" });
        }

        // If completed, transition to success screen
        if (log.pct === 100) {
          setTimeout(() => {
            setSimulatorStep(4);
          }, 1000);
        }
      }, log.delay);
    });
  };

  const handleFinishSimulator = () => {
    setIsSimulatorOpen(false);
    // Redirect to login screen passing simulator state
    navigate("/login", { 
      state: { 
        adminEmail: adminEmail, 
        companyName: companyName,
        subdomain: subdomain,
        provisioned: true 
      } 
    });
  };

  return (
    <div className={styles.landingContainer}>
      
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navbarContent}>
          <div className={styles.logo} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className={styles.logoIcon}>
              <Zap size={22} className={styles.greenText} />
            </div>
            <span>Controla <span className={styles.greenText}>Fácil</span></span>
          </div>

          <div className={styles.navLinks}>
            <a href="#beneficios" className={styles.navLink}>Benefícios</a>
            <a href="#como-funciona" className={styles.navLink}>Exclusividade Single-Tenant</a>
            <a href="#planos" className={styles.navLink}>Planos</a>
            <a href="#faq" className={styles.navLink}>Dúvidas</a>
          </div>

          <div className={styles.navActions}>
            <button onClick={() => navigate("/login")} className={styles.btnNavLogin}>
              Entrar
            </button>
            <a href="#planos" className={styles.btnNavCTA}>
              Simular Contratação
            </a>
          </div>

          <button className={styles.mobileMenuToggle} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <a href="#beneficios" onClick={() => setMobileMenuOpen(false)}>Benefícios</a>
            <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)}>Exclusividade Single-Tenant</a>
            <a href="#planos" onClick={() => setMobileMenuOpen(false)}>Planos</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>Dúvidas</a>
            <hr className={styles.divider} />
            <button onClick={() => { setMobileMenuOpen(false); navigate("/login"); }} className={styles.mobileBtnLogin}>
              Entrar
            </button>
            <a href="#planos" onClick={() => setMobileMenuOpen(false)} className={styles.mobileBtnCTA}>
              Simular Contratação
            </a>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <header className={styles.heroSection}>
        <div className={styles.heroGrid}>
          <div className={styles.heroTextContent}>
            <div className={styles.academicBadge}>
              <Sparkles size={14} className={styles.greenText} /> 
              <span>Simulador Acadêmico de E-Commerce</span>
            </div>
            
            <h1 className={styles.heroTitle}>
              O estoque e as integrações do seu e-commerce, <span className={styles.highlightText}>exclusivos</span> para você.
            </h1>
            
            <p className={styles.heroDescription}>
              Uma plataforma ágil para gerenciar estoques integrados em marketplaces. Diga adeus a vendas sem estoque e ganhe a robustez de um <strong>servidor dedicado</strong> com isolamento absoluto de dados (Single-Tenant).
            </p>
            
            <div className={styles.heroCTAButtons}>
              <a href="#planos" className={styles.btnHeroPrimary}>
                Simular Contratação <ArrowRight size={18} />
              </a>
              <a href="#como-funciona" className={styles.btnHeroSecondary}>
                Entenda o Single-Tenant
              </a>
            </div>
            
            <div className={styles.heroTrustIndicators}>
              <div className={styles.trustItem}>
                <Shield size={16} className={styles.greenText} />
                <span>Banco de dados isolado</span>
              </div>
              <div className={styles.trustItem}>
                <Zap size={16} className={styles.greenText} />
                <span>Integração instantânea</span>
              </div>
              <div className={styles.trustItem}>
                <Check size={16} className={styles.greenText} />
                <span>Implantação em minutos</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC DASHBOARD MOCKUP */}
          <div className={styles.heroMockupArea}>
            <div className={styles.dashboardMockup}>
              
              {/* Mockup Header */}
              <div className={styles.mockupHeader}>
                <div className={styles.mockupDots}>
                  <span className={styles.dotRed}></span>
                  <span className={styles.dotYellow}></span>
                  <span className={styles.dotGreen}></span>
                </div>
                <div className={styles.mockupUrl}>
                  <Lock size={12} className={styles.greenText} /> 
                  <span>demo-loja.controlafacil.com.br/dashboard</span>
                </div>
              </div>

              {/* Mockup Body */}
              <div className={styles.mockupBody}>
                {/* Mockup Sidebar */}
                <div className={styles.mockupSidebar}>
                  <div className={styles.mockupLogo}>
                    <Zap size={16} className={styles.greenText} />
                    <span className={styles.mockupLogoText}>CF</span>
                  </div>
                  <div className={styles.mockupSidebarItems}>
                    <span className={`${styles.mockupSidebarItem} ${styles.mockupSidebarActive}`}><Layers size={14} /></span>
                    <span className={styles.mockupSidebarItem}><ShoppingBag size={14} /></span>
                    <span className={styles.mockupSidebarItem}><Database size={14} /></span>
                    <span className={styles.mockupSidebarItem}><BarChart3 size={14} /></span>
                  </div>
                </div>

                {/* Mockup Main Content */}
                <div className={styles.mockupMain}>
                  {/* Title Bar */}
                  <div className={styles.mockupTitleBar}>
                    <div>
                      <span className={styles.mockupBreadcrumb}>Dashboard / Geral</span>
                      <h4 className={styles.mockupTitle}>Painel Integrador</h4>
                    </div>
                    <span className={styles.mockupBadge}>Conectado AWS <span className={styles.mockupBadgeDot}></span></span>
                  </div>

                  {/* Cards Grid */}
                  <div className={styles.mockupCardsGrid}>
                    <div className={styles.mockupCard}>
                      <span className={styles.mockupCardLabel}>Vendas do Mês</span>
                      <div className={styles.mockupCardFlex}>
                        <h3 className={styles.mockupCardVal}>{mockSales}</h3>
                        <span className={styles.mockupTrend}>+12.4%</span>
                      </div>
                    </div>
                    
                    <div className={styles.mockupCard}>
                      <span className={styles.mockupCardLabel}>Alertas de Ruptura</span>
                      <div className={styles.mockupCardFlex}>
                        <h3 className={`${styles.mockupCardVal} ${mockStockAlerts > 0 ? styles.alertText : ""}`}>
                          {mockStockAlerts}
                        </h3>
                        <span className={styles.mockupTrendDown}>Atenção</span>
                      </div>
                    </div>
                  </div>

                  {/* Graphic & Activities */}
                  <div className={styles.mockupDataGrid}>
                    {/* Visual graph */}
                    <div className={styles.mockupGraphCard}>
                      <span className={styles.mockupCardLabel}>Desempenho Semanal</span>
                      <div className={styles.mockupGraphLines}>
                        <div className={styles.mockupGraphBar} style={{ height: "45%" }}></div>
                        <div className={styles.mockupGraphBar} style={{ height: "60%" }}></div>
                        <div className={styles.mockupGraphBar} style={{ height: "55%" }}></div>
                        <div className={styles.mockupGraphBar} style={{ height: "85%" }}></div>
                        <div className={styles.mockupGraphBar} style={{ height: "70%" }}></div>
                        <div className={styles.mockupGraphBar} style={{ height: "95%" }}></div>
                        <div className={styles.mockupGraphBar} style={{ height: "90%" }}></div>
                      </div>
                    </div>

                    {/* Order Feed */}
                    <div className={styles.mockupFeedCard}>
                      <span className={styles.mockupCardLabel}>Última Venda Sincronizada</span>
                      <div className={styles.feedItem}>
                        <div className={styles.feedItemHeader}>
                          <span className={styles.feedItemChannel}>{lastOrder.store}</span>
                          <span className={styles.feedItemTime}>{lastOrder.time}</span>
                        </div>
                        <div className={styles.feedItemBody}>
                          <span>Pedido {lastOrder.id}</span>
                          <strong>{lastOrder.val}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Marketplace Badges */}
                  <div className={styles.mockupMarketplaces}>
                    <span className={styles.channelBadge}>Mercado Livre <span className={styles.channelDotActive}></span></span>
                    <span className={styles.channelBadge}>Shopee <span className={styles.channelDotActive}></span></span>
                    <span className={styles.channelBadge}>WooCommerce <span className={styles.channelDotActive}></span></span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* BENEFITS SECTION */}
      <section id="beneficios" className={styles.benefitsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubtitle}>Diferenciais e Benefícios</span>
          <h2 className={styles.sectionTitle}>Tudo o que seu negócio precisa para crescer sem travar</h2>
          <p className={styles.sectionDescription}>
            Nossas funcionalidades foram moldadas para resolver as principais dores de pequenos e médios lojistas que vendem em múltiplos canais.
          </p>
        </div>

        <div className={styles.benefitsGrid}>
          {/* Benefit 1 */}
          <div className={styles.benefitCard}>
            <div className={styles.benefitIconContainer}>
              <Layers className={styles.benefitIcon} size={24} />
            </div>
            <h3 className={styles.benefitCardTitle}>Sincronização Integrada</h3>
            <p className={styles.benefitCardDesc}>
              Importe pedidos do Mercado Livre, Shopee e outros diretamente. A baixa do estoque é efetuada em todas as vitrines instantaneamente após a venda.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className={styles.benefitCard}>
            <div className={styles.benefitIconContainer}>
              <Database className={styles.benefitIcon} size={24} />
            </div>
            <h3 className={styles.benefitCardTitle}>Banco de Dados Exclusivo</h3>
            <p className={styles.benefitCardDesc}>
              Chega de misturar dados ou sofrer vazamentos. A infraestrutura single-tenant do Controla Fácil isola completamente os dados da sua empresa.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className={styles.benefitCard}>
            <div className={styles.benefitIconContainer}>
              <Zap className={styles.benefitIcon} size={24} />
            </div>
            <h3 className={styles.benefitCardTitle}>Automação Rápida</h3>
            <p className={styles.benefitCardDesc}>
              Ajuste preços, edite detalhes dos produtos e atualize as fichas técnicas de vários canais com apenas alguns cliques no seu painel exclusivo.
            </p>
          </div>

          {/* Benefit 4 */}
          <div className={styles.benefitCard}>
            <div className={styles.benefitIconContainer}>
              <TrendingUp className={styles.benefitIcon} size={24} />
            </div>
            <h3 className={styles.benefitCardTitle}>Relatórios Estratégicos</h3>
            <p className={styles.benefitCardDesc}>
              Analise facilmente quais canais geram mais lucro, acompanhe produtos parados e receba alertas inteligentes de reposição antes que acabe.
            </p>
          </div>
        </div>
      </section>

      {/* SINGLE-TENANT EXPLANATION SECTION */}
      <section id="como-funciona" className={styles.tenantExplanationSection}>
        <div className={styles.tenantGrid}>
          <div className={styles.tenantVisualArea}>
            <div className={styles.architectureDiagram}>
              {/* Box Multi-tenant */}
              <div className={styles.diagramBox}>
                <h4 className={styles.diagramBoxTitle}>Sistemas Tradicionais (Multi-Tenant)</h4>
                <p className={styles.diagramBoxSubtitle}>Acesso compartilhado e vulnerável</p>
                <div className={styles.multiTenantVisual}>
                  <div className={styles.tenantUserNode}>Empresa A</div>
                  <div className={styles.tenantUserNode}>Empresa B</div>
                  <div className={styles.tenantUserNode}>Empresa C</div>
                  <div className={styles.connectorLines}>↓↓↓</div>
                  <div className={`${styles.sharedDbNode} ${styles.dangerBg}`}>
                    <Database size={16} /> Servidor & Banco de Dados Único Compartilhado
                  </div>
                </div>
                <span className={styles.diagramWarning}>Instabilidades e lentidões frequentes por sobrecarga alheia.</span>
              </div>

              {/* Box Single-tenant */}
              <div className={`${styles.diagramBox} ${styles.activeDiagramBox}`}>
                <div className={styles.activeDiagramPulse}></div>
                <h4 className={styles.diagramBoxTitle}>Controla Fácil (Single-Tenant)</h4>
                <p className={styles.diagramBoxSubtitle}>Arquitetura Dedicada e Protegida</p>
                <div className={styles.singleTenantVisual}>
                  <div className={styles.instanceRow}>
                    <div className={styles.tenantUserNodeActive}>Sua Empresa</div>
                    <div className={styles.connectorLineHorizontal}>→</div>
                    <div className={`${styles.dedicatedDbNode} ${styles.successBg}`}>
                      <Server size={14} /> Instância Isolada Dedicada (AWS)
                    </div>
                  </div>
                  <div className={styles.instanceRowOpacity}>
                    <div className={styles.tenantUserNode}>Outros</div>
                    <div className={styles.connectorLineHorizontal}>→</div>
                    <div className={styles.dedicatedDbNode}>
                      <Server size={14} /> Instância Isolada de Terceiros
                    </div>
                  </div>
                </div>
                <span className={styles.diagramSuccess}>Desempenho consistente, segurança militar e zero interferência externa.</span>
              </div>
            </div>
          </div>

          <div className={styles.tenantTextContent}>
            <span className={styles.sectionSubtitle}>Segurança e Performance</span>
            <h2 className={styles.tenantTitle}>Sua empresa merece uma infraestrutura própria e veloz</h2>
            <p className={styles.tenantDesc}>
              A maioria das plataformas modernas de e-commerce agrupam milhares de lojistas no mesmo servidor. Se um concorrente realiza uma campanha massiva e sobrecarrega o sistema, a sua loja fica lenta e você perde vendas.
            </p>
            <p className={styles.tenantDesc}>
              No **Controla Fácil**, acreditamos no modelo <strong>Single-Tenant</strong> para planos de crescimento. Ao contratar, nós provisionamos automaticamente uma máquina virtual exclusiva na AWS para rodar apenas a sua aplicação.
            </p>
            
            <div className={styles.featuresCheckList}>
              <div className={styles.checkListItem}>
                <CheckCircle2 size={18} className={styles.greenText} />
                <span>Isolamento total de dados de estoque e clientes.</span>
              </div>
              <div className={styles.checkListItem}>
                <CheckCircle2 size={18} className={styles.greenText} />
                <span>Subdomínio personalizado para seu negócio (ex: suaempresa.controlafacil.com.br).</span>
              </div>
              <div className={styles.checkListItem}>
                <CheckCircle2 size={18} className={styles.greenText} />
                <span>Desempenho garantido, sem gargalos causados por outros lojistas.</span>
              </div>
              <div className={styles.checkListItem}>
                <CheckCircle2 size={18} className={styles.greenText} />
                <span>Ideal para auditorias e conformidade com a LGPD.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANS SECTION */}
      <section id="planos" className={styles.plansSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubtitle}>Preços Simples e Transparentes</span>
          <h2 className={styles.sectionTitle}>Escolha o plano ideal para a sua jornada</h2>
          <p className={styles.sectionDescription}>
            Valores acessíveis desenhados especificamente para alavancar pequenos e médios e-commerces. Experimente nosso fluxo de contratação simulado!
          </p>

          {/* Pricing Toggle */}
          <div className={styles.toggleContainer}>
            <span className={billingPeriod === "monthly" ? styles.activePeriod : ""}>Faturamento Mensal</span>
            <button 
              className={styles.toggleBtn} 
              onClick={() => setBillingPeriod(prev => prev === "monthly" ? "annual" : "monthly")}
              aria-label="Alternar período de faturamento"
            >
              <div className={`${styles.toggleSlider} ${billingPeriod === "annual" ? styles.sliderRight : ""}`}></div>
            </button>
            <span className={billingPeriod === "annual" ? styles.activePeriod : ""}>
              Faturamento Anual <span className={styles.discountBadge}>Economize 20%</span>
            </span>
          </div>
        </div>

        <div className={styles.plansGrid}>
          {plans.map(plan => {
            const price = billingPeriod === "monthly" ? plan.priceMonthly : plan.priceAnnual;
            return (
              <div 
                key={plan.id} 
                className={`${styles.planCard} ${plan.isRecommended ? styles.planCardRecommended : ""}`}
              >
                {plan.isRecommended && (
                  <div className={styles.recommendedBadge}>{plan.badge}</div>
                )}
                
                <div className={styles.planCardHeader}>
                  <span className={styles.planBadge}>{plan.tenantType}</span>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <p className={styles.planDesc}>{plan.description}</p>
                </div>

                <div className={styles.planPriceArea}>
                  <span className={styles.currencySymbol}>R$</span>
                  <span className={styles.planPrice}>
                    {price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={styles.pricePeriod}>/mês</span>
                  {billingPeriod === "annual" && (
                    <span className={styles.annualDetail}>Cobrado anualmente</span>
                  )}
                </div>

                <hr className={styles.planDivider} />

                <ul className={styles.planFeaturesList}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className={styles.planFeatureItem}>
                      {feature.includes("Single-Tenant") || feature.includes("Exclusiva") || feature.includes("VIP") ? (
                        <Check size={16} className={styles.greenTextStrong} />
                      ) : (
                        <Check size={16} className={styles.blueText} />
                      )}
                      <span className={feature.includes("Single-Tenant") || feature.includes("Exclusiva") ? styles.highlightedFeature : ""}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleOpenSimulator(plan)} 
                  className={`${styles.btnPlanCTA} ${plan.isRecommended ? styles.btnPlanCTARecommended : ""}`}
                >
                  Contratar Agora (Simulação)
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className={styles.faqSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubtitle}>FAQ</span>
          <h2 className={styles.sectionTitle}>Perguntas Frequentes</h2>
          <p className={styles.sectionDescription}>
            Tem dúvidas sobre o Controla Fácil ou sobre a contratação simulada? Encontre as respostas abaixo.
          </p>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`${styles.faqItem} ${activeFaq === idx ? styles.faqItemActive : ""}`}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className={styles.faqQuestion}>
                <span>{faq.question}</span>
                <ChevronDown size={18} className={styles.faqArrow} />
              </div>
              {activeFaq === idx && (
                <div className={styles.faqAnswer}>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerMainCol}>
            <div className={styles.footerLogo}>
              <Zap size={20} className={styles.greenText} />
              <span>Controla <span className={styles.greenText}>Fácil</span></span>
            </div>
            <p className={styles.footerAbout}>
              O integrador inteligente de estoque e marketplaces projetado especificamente para o pequeno e médio varejista digital.
            </p>
          </div>
          
          <div className={styles.footerLinksCol}>
            <h4>Navegação</h4>
            <a href="#beneficios">Benefícios</a>
            <a href="#como-funciona">Arquitetura</a>
            <a href="#planos">Planos</a>
            <a href="#faq">Dúvidas</a>
          </div>

          <div className={styles.footerAcademicCol}>
            <h4>Projeto Acadêmico</h4>
            <p>Este sistema é um projeto fictício para fins de avaliação universitária de arquitetura de software.</p>
            <p className={styles.smallAcademicAlert}>Toda a cobrança e infraestrutura demonstradas na contratação são simuladas.</p>
          </div>
        </div>

        <div className={styles.footerCopyright}>
          <p>&copy; {new Date().getFullYear()} Controla Fácil S/A. Desenvolvido para propósitos didáticos.</p>
        </div>
      </footer>

      {/* PROVISIONING SIMULATOR MODAL */}
      {isSimulatorOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContainer}>
            
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitle}>
                <Cpu size={20} className={styles.greenText} />
                <h3>Simulador de Implantação Controla Fácil</h3>
              </div>
              <button className={styles.modalCloseBtn} onClick={() => setIsSimulatorOpen(false)} aria-label="Fechar modal">
                <X size={20} />
              </button>
            </div>

            {/* Step Wizard Indicator */}
            <div className={styles.wizardSteps}>
              <div className={`${styles.wizardStep} ${simulatorStep >= 1 ? styles.wizardStepActive : ""}`}>
                <span className={styles.stepNum}>1</span>
                <span className={styles.stepLabel}>Cadastro</span>
              </div>
              <div className={styles.wizardLine}></div>
              <div className={`${styles.wizardStep} ${simulatorStep >= 2 ? styles.wizardStepActive : ""}`}>
                <span className={styles.stepNum}>2</span>
                <span className={styles.stepLabel}>Instância</span>
              </div>
              <div className={styles.wizardLine}></div>
              <div className={`${styles.wizardStep} ${simulatorStep >= 3 ? styles.wizardStepActive : ""}`}>
                <span className={styles.stepNum}>3</span>
                <span className={styles.stepLabel}>Implantação</span>
              </div>
              <div className={styles.wizardLine}></div>
              <div className={`${styles.wizardStep} ${simulatorStep >= 4 ? styles.wizardStepActive : ""}`}>
                <span className={styles.stepNum}>4</span>
                <span className={styles.stepLabel}>Sucesso</span>
              </div>
            </div>

            {/* STEP 1: FORM */}
            {simulatorStep === 1 && (
              <form onSubmit={handleNextToSubdomain} className={styles.modalBody}>
                <div className={styles.modalIntro}>
                  <h4>Inicie seu teste gratuito de 14 dias no plano <strong className={styles.greenText}>{selectedPlan?.name}</strong></h4>
                  <p>Informe os dados cadastrais da sua empresa para prosseguirmos com a simulação do servidor.</p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="company-name">Nome da Empresa / Loja Virtual *</label>
                  <input 
                    type="text" 
                    id="company-name"
                    placeholder="Ex: Minha Loja de Calçados Ltda"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="admin-email">E-mail Administrativo *</label>
                    <input 
                      type="email" 
                      id="admin-email"
                      placeholder="admin@sualoja.com.br"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="admin-phone">Telefone / WhatsApp *</label>
                    <input 
                      type="tel" 
                      id="admin-phone"
                      placeholder="(11) 99999-9999"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.modalWarningBox}>
                  <AlertCircle size={18} className={styles.yellowText} />
                  <span>Atenção: Nenhuma transação financeira real será processada. Este formulário é estritamente simulado.</span>
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" className={styles.btnSecModal} onClick={() => setIsSimulatorOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className={styles.btnPriModal}>
                    Configurar Servidor <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: SUBDOMAIN */}
            {simulatorStep === 2 && (
              <div className={styles.modalBody}>
                <div className={styles.modalIntro}>
                  <h4>Defina o seu endereço exclusivo na web</h4>
                  <p>Por ser um sistema Single-Tenant, sua loja terá um subdomínio isolado para acessar o painel de administração.</p>
                </div>

                <div className={styles.subdomainSetupArea}>
                  <label htmlFor="subdomain-input">Subdomínio de Acesso Exclusivo</label>
                  <div className={styles.subdomainInputGroup}>
                    <input 
                      type="text" 
                      id="subdomain-input"
                      placeholder="minhaloja"
                      value={subdomain}
                      onChange={(e) => {
                        const cleaned = e.target.value
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/[^a-z0-9-]/g, ""); // Allow lowercase letters, numbers, and dashes
                        setSubdomain(cleaned);
                        setIsSubdomainAvailable(null);
                      }}
                    />
                    <span className={styles.subdomainSuffix}>.controlafacil.com.br</span>
                  </div>

                  <div className={styles.subdomainCheckRow}>
                    <button 
                      type="button" 
                      onClick={checkSubdomainAvailability}
                      disabled={isCheckingSubdomain || !subdomain}
                      className={styles.btnVerifySubdomain}
                    >
                      {isCheckingSubdomain ? "Verificando..." : "Verificar Disponibilidade"}
                    </button>

                    {isSubdomainAvailable === true && (
                      <span className={styles.checkSuccess}>
                        <CheckCircle2 size={16} /> Subdomínio livre para implantação!
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.modalInfoBox}>
                  <Server size={18} className={styles.blueText} />
                  <div>
                    <strong>Tipo de implantação:</strong>
                    <p>{selectedPlan?.tenantType} dedicando recursos isolados para {subdomain}.controlafacil.com.br.</p>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" className={styles.btnSecModal} onClick={() => setSimulatorStep(1)}>
                    Voltar
                  </button>
                  <button 
                    type="button" 
                    className={styles.btnPriModal}
                    onClick={handleStartProvisioning}
                    disabled={!isSubdomainAvailable}
                  >
                    Iniciar Implantação <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PROVISIONING ANIMATION */}
            {simulatorStep === 3 && (
              <div className={styles.modalBody}>
                <div className={styles.modalIntro}>
                  <h4>Provisionando sua Instância Dedicada...</h4>
                  <p>Por favor, não feche esta janela. Estamos orquestrando os serviços em nuvem na AWS para criar sua infraestrutura exclusiva.</p>
                </div>

                {/* Graphical cloud deployment map */}
                <div className={styles.cloudMapArea}>
                  <div className={styles.cloudNode}>
                    <Globe size={18} className={provisioningProgress >= 80 ? styles.nodeActiveIcon : ""} />
                    <span>Subdomínio</span>
                  </div>
                  <div className={`${styles.cloudLinkLine} ${provisioningProgress >= 80 ? styles.linkLineActive : ""}`}></div>
                  
                  <div className={styles.cloudNode}>
                    <Server size={18} className={provisioningProgress >= 30 ? styles.nodeActiveIcon : ""} />
                    <span>Servidor VM</span>
                  </div>
                  <div className={`${styles.cloudLinkLine} ${provisioningProgress >= 50 ? styles.linkLineActive : ""}`}></div>
                  
                  <div className={styles.cloudNode}>
                    <Database size={18} className={provisioningProgress >= 50 ? styles.nodeActiveIcon : ""} />
                    <span>Banco Isolado</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className={styles.progressContainer}>
                  <div className={styles.progressHeader}>
                    <span>Progresso do Setup</span>
                    <span>{provisioningProgress}%</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressBarFill} style={{ width: `${provisioningProgress}%` }}></div>
                  </div>
                </div>

                {/* Developer CLI logs console */}
                <div className={styles.consoleLogBox}>
                  <div className={styles.consoleLogHeader}>
                    <Terminal size={14} />
                    <span>LOGS DE IMPLANTAÇÃO - CONSOLE</span>
                  </div>
                  <div className={styles.consoleLogContent}>
                    {consoleLogs.map((log, index) => (
                      <div key={index} className={styles.consoleLogLine}>{log}</div>
                    ))}
                    <div ref={consoleBottomRef} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS */}
            {simulatorStep === 4 && (
              <div className={styles.modalBody}>
                <div className={styles.successAnimationArea}>
                  <div className={styles.successCircle}>
                    <Check size={48} className={styles.greenTextStrong} />
                  </div>
                  <h3>Instância Implantada com Sucesso!</h3>
                  <p>O servidor dedicado para a empresa <strong>{companyName}</strong> está ativo e pronto para uso acadêmico.</p>
                </div>

                <div className={styles.credentialsCard}>
                  <h4>Dados de Acesso da sua Instância</h4>
                  <div className={styles.credentialRow}>
                    <span className={styles.credLabel}>Endereço do Painel:</span>
                    <strong className={styles.credVal}>{subdomain}.controlafacil.com.br</strong>
                  </div>
                  <div className={styles.credentialRow}>
                    <span className={styles.credLabel}>E-mail de Login:</span>
                    <strong className={styles.credVal}>{adminEmail}</strong>
                  </div>
                  <div className={styles.credentialRow}>
                    <span className={styles.credLabel}>Senha Temporária:</span>
                    <strong className={styles.credVal}>CF-@Admin2026</strong>
                  </div>
                </div>

                <div className={styles.modalInfoBox}>
                  <AlertCircle size={18} className={styles.blueText} />
                  <span>
                    Como esta é uma simulação, ao clicar em entrar nós iremos pré-preencher suas credenciais para que você possa explorar a plataforma sem complicações!
                  </span>
                </div>

                <div className={styles.modalFooter}>
                  <button 
                    type="button" 
                    className={styles.btnPriModalFull}
                    onClick={handleFinishSimulator}
                  >
                    Acessar minha Instância Dedicada <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
