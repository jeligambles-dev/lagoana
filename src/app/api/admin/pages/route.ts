import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") return null;
  return session;
}

const DEFAULT_PAGES: Record<string, { title: string; content: string }> = {
  despre: {
    title: "Despre Lagoana",
    content: `<section class="bg-gradient-to-br from-[#1B3A2B] via-[#0F2019] to-[#0B0B0B]">
  <div class="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
    <h1 class="text-3xl sm:text-5xl font-bold mb-6 text-[#EDEDED]">
      Despre <span class="text-gold">Lagoana</span>
    </h1>
    <p class="text-[#888] text-lg max-w-2xl mx-auto leading-relaxed">
      Lagoana este piata online romaneasca dedicata echipamentului de vanatoare. Platforma noastra ofera un spatiu sigur si de incredere unde vanatorii pot cumpara si vinde echipament, complet gratuit.
    </p>
  </div>
</section>

<section class="max-w-4xl mx-auto px-4 py-12">
  <div class="bg-[#111111] rounded-xl border border-[#2A2A2A] p-8">
    <h2 class="text-2xl font-bold text-[#EDEDED] mb-4">Ce este Lagoana?</h2>
    <div class="space-y-4 text-[#888] leading-relaxed">
      <p>Lagoana este o piata online de anunturi clasificate dedicata echipamentului de vanatoare din Romania. Fie ca esti un vanator experimentat sau abia incepi, platforma noastra iti ofera acces la o gama larga de echipamente: arme, munitie, optica, cutite, echipament outdoor si multe altele.</p>
      <p>Publicarea anunturilor este complet <span class="text-gold font-medium">gratuita</span>. Credem ca accesul la o piata echitabila nu ar trebui sa coste nimic. Comunitatea noastra de vanatori creste in fiecare zi, oferind un mediu activ si de incredere pentru tranzactii.</p>
    </div>
  </div>
</section>

<section class="max-w-4xl mx-auto px-4 pb-12">
  <div class="bg-[#111111] rounded-xl border border-[#2A2A2A] p-8">
    <h2 class="text-2xl font-bold text-[#EDEDED] mb-4">Misiunea noastra</h2>
    <div class="space-y-4 text-[#888] leading-relaxed">
      <p>Misiunea Lagoana este sa <span class="text-gold font-medium">modernizeze</span> piata echipamentului de vanatoare din Romania. Vrem sa oferim o platforma sigura, transparenta si usor de utilizat, unde vanatorii pot gasi exact ce au nevoie.</p>
      <p>Ne propunem sa construim un mediu de incredere, unde fiecare utilizator este verificat si unde tranzactiile se desfasoara in conditii de siguranta. Platforma respecta legislatia romaneasca in vigoare privind armele si munitia.</p>
    </div>
  </div>
</section>`,
  },
  termeni: {
    title: "Termeni si Conditii",
    content: `<h1 class="text-3xl sm:text-4xl font-bold text-[#EDEDED] mb-8">
  Termeni si <span class="text-gold">Conditii</span>
</h1>

<div class="space-y-8">
  <section class="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
    <h2 class="text-xl font-semibold text-[#EDEDED] mb-4">1. Descrierea platformei</h2>
    <div class="space-y-3 text-[#888] leading-relaxed">
      <p>Lagoana (denumita in continuare &quot;Platforma&quot;) este un serviciu online de anunturi clasificate dedicat echipamentului de vanatoare. Platforma permite utilizatorilor sa publice si sa vizualizeze anunturi de vanzare, cumparare sau schimb de echipament.</p>
      <p>Platforma actioneaza exclusiv ca intermediar, punand la dispozitie spatiul de publicare a anunturilor. <strong class="text-[#EDEDED]">Lagoana nu este parte in nicio tranzactie</strong> intre utilizatori si nu garanteaza calitatea, legalitatea sau siguranta produselor listate.</p>
      <p>Tranzactiile se desfasoara direct intre utilizatori, pe propria lor raspundere. Platforma nu proceseaza plati si nu ofera servicii de escrow.</p>
    </div>
  </section>

  <section class="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
    <h2 class="text-xl font-semibold text-[#EDEDED] mb-4">2. Cerinte pentru utilizatori</h2>
    <div class="space-y-3 text-[#888] leading-relaxed">
      <p>Pentru a utiliza Platforma, trebuie sa indepliniti urmatoarele conditii:</p>
      <ul class="list-disc list-inside space-y-2 ml-2">
        <li>Sa aveti varsta minima de <strong class="text-[#EDEDED]">18 ani</strong>.</li>
        <li>Sa furnizati informatii corecte si actualizate la inregistrare.</li>
        <li>Pentru anunturile care implica arme de foc sau munitie, sa detineti <strong class="text-[#EDEDED]">documentele legale valabile</strong> (permis de arma, autorizatie de detinere/port arma conform Legii 295/2004).</li>
        <li>Sa respectati legislatia romaneasca in vigoare privind detinerea, portul si comercializarea armelor si munitiilor.</li>
      </ul>
    </div>
  </section>

  <section class="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
    <h2 class="text-xl font-semibold text-[#EDEDED] mb-4">3. Articole si activitati interzise</h2>
    <div class="space-y-3 text-[#888] leading-relaxed">
      <p>Este strict interzisa publicarea de anunturi care implica:</p>
      <ul class="list-disc list-inside space-y-2 ml-2">
        <li><strong class="text-[#EDEDED]">Bunuri furate</strong> sau obtinute prin mijloace ilegale.</li>
        <li>Arme sau munitie detinute fara documentele legale necesare.</li>
        <li><strong class="text-[#EDEDED]">Modificari ilegale</strong> ale armelor (amortizoare de sunet neautorizate, modificari ale mecanismului de tragere, conversii la foc automat etc.).</li>
        <li>Substante interzise, explozibili sau materiale pirotehnice.</li>
        <li>Orice articol a carui vanzare sau detinere este interzisa de legislatia romaneasca.</li>
        <li>Anunturi false, inselatoare sau care incalca drepturile altor persoane.</li>
      </ul>
      <p>Platforma isi rezerva dreptul de a sterge orice anunt care incalca acesti termeni si de a suspenda sau dezactiva contul utilizatorului.</p>
    </div>
  </section>

  <section class="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
    <h2 class="text-xl font-semibold text-[#EDEDED] mb-4">4. Legislatia privind armele de foc</h2>
    <div class="space-y-3 text-[#888] leading-relaxed">
      <p>Utilizatorii sunt obligati sa respecte prevederile <strong class="text-[#EDEDED]">Legii nr. 295/2004</strong> privind regimul armelor si al munitiilor, cu modificarile si completarile ulterioare, precum si orice alta legislatie aplicabila.</p>
      <p>Transferul dreptului de proprietate asupra armelor letale se realizeaza exclusiv prin intermediul armurerilor autorizati, conform legii. Platforma nu faciliteaza si nu autorizeaza transferuri directe de arme intre persoane fizice.</p>
      <p>Utilizatorii poarta intreaga responsabilitate pentru respectarea obligatiilor legale care le revin in calitate de detinatori sau comercianti de arme si munitii.</p>
    </div>
  </section>

  <section class="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
    <h2 class="text-xl font-semibold text-[#EDEDED] mb-4">5. Limitarea raspunderii</h2>
    <div class="space-y-3 text-[#888] leading-relaxed">
      <p>Platforma Lagoana:</p>
      <ul class="list-disc list-inside space-y-2 ml-2">
        <li>Nu garanteaza acuratetea, completitudinea sau legalitatea informatiilor din anunturi.</li>
        <li>Nu este responsabila pentru daunele directe sau indirecte rezultate din tranzactiile intre utilizatori.</li>
        <li>Nu ofera garantii privind disponibilitatea continua a serviciului.</li>
        <li>Isi rezerva dreptul de a modifica, suspenda sau intrerupe serviciul in orice moment, fara notificare prealabila.</li>
        <li>Nu este responsabila pentru continutul generat de utilizatori, inclusiv fotografii, descrieri sau mesaje.</li>
      </ul>
    </div>
  </section>

  <section class="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
    <h2 class="text-xl font-semibold text-[#EDEDED] mb-4">6. Protectia datelor personale (GDPR)</h2>
    <div class="space-y-3 text-[#888] leading-relaxed">
      <p>Lagoana prelucreaza datele personale in conformitate cu Regulamentul General privind Protectia Datelor (GDPR - Regulamentul UE 2016/679) si legislatia romaneasca aplicabila.</p>
      <p>In calitate de utilizator, aveti urmatoarele drepturi:</p>
      <ul class="list-disc list-inside space-y-2 ml-2">
        <li><strong class="text-[#EDEDED]">Dreptul de acces</strong> - puteti solicita o copie a datelor personale pe care le detinem despre dumneavoastra.</li>
        <li><strong class="text-[#EDEDED]">Dreptul la rectificare</strong> - puteti cere corectarea datelor incorecte sau incomplete.</li>
        <li><strong class="text-[#EDEDED]">Dreptul la stergere</strong> (&quot;dreptul de a fi uitat&quot;) - puteti solicita stergerea datelor personale.</li>
        <li><strong class="text-[#EDEDED]">Dreptul la portabilitatea datelor</strong> - puteti primi datele intr-un format structurat, utilizat in mod curent.</li>
        <li><strong class="text-[#EDEDED]">Dreptul la opozitie</strong> - va puteti opune prelucrarii datelor in anumite circumstante.</li>
      </ul>
      <p>Pentru exercitarea acestor drepturi, ne puteti contacta la adresa de email: <a href="mailto:contact@lagoana.ro" class="text-gold hover:underline">contact@lagoana.ro</a>.</p>
    </div>
  </section>

  <section class="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
    <h2 class="text-xl font-semibold text-[#EDEDED] mb-4">7. Modificarea termenilor</h2>
    <div class="space-y-3 text-[#888] leading-relaxed">
      <p>Lagoana isi rezerva dreptul de a modifica acesti Termeni si Conditii in orice moment. Modificarile intra in vigoare la data publicarii pe Platforma. Continuarea utilizarii Platformei dupa modificarea termenilor constituie acceptarea noilor conditii.</p>
      <p>Utilizatorii vor fi notificati prin email sau prin intermediul Platformei cu privire la modificarile semnificative ale termenilor.</p>
    </div>
  </section>
</div>`,
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    let page = await prisma.pageContent.findUnique({ where: { slug } });

    // Seed default content if not found
    if (!page && DEFAULT_PAGES[slug]) {
      page = await prisma.pageContent.create({
        data: {
          slug,
          title: DEFAULT_PAGES[slug].title,
          content: DEFAULT_PAGES[slug].content,
        },
      });
    }

    if (!page) {
      return NextResponse.json({ error: "Pagina nu a fost gasita" }, { status: 404 });
    }

    return NextResponse.json(page);
  }

  // List all pages - seed defaults if needed
  const existing = await prisma.pageContent.findMany({ orderBy: { slug: "asc" } });
  const existingSlugs = new Set(existing.map((p) => p.slug));

  for (const [s, data] of Object.entries(DEFAULT_PAGES)) {
    if (!existingSlugs.has(s)) {
      const created = await prisma.pageContent.create({
        data: { slug: s, title: data.title, content: data.content },
      });
      existing.push(created);
    }
  }

  existing.sort((a, b) => a.slug.localeCompare(b.slug));
  return NextResponse.json(existing);
}

export async function PUT(request: NextRequest) {
  const session = await verifyAdmin();
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
  }

  const { slug, title, content } = await request.json();

  if (!slug || !title || !content) {
    return NextResponse.json({ error: "Toate campurile sunt obligatorii" }, { status: 400 });
  }

  const page = await prisma.pageContent.upsert({
    where: { slug },
    update: { title, content, updatedBy: session.user.id },
    create: { slug, title, content, updatedBy: session.user.id },
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: "update_page",
      targetType: "page_content",
      targetId: page.id,
      details: JSON.stringify({ slug, title }),
    },
  });

  return NextResponse.json(page);
}
