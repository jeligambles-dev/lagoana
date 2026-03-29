import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni si Conditii",
  description:
    "Termenii si conditiile de utilizare a platformei Lagoana - piata online de echipament de vanatoare.",
};

export default function TermeniPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-[#EDEDED] mb-8">
        Termeni si <span className="text-gold">Conditii</span>
      </h1>

      <div className="space-y-8">
        {/* 1. Descrierea platformei */}
        <section className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-[#EDEDED] mb-4">
            1. Descrierea platformei
          </h2>
          <div className="space-y-3 text-[#888] leading-relaxed">
            <p>
              Lagoana (denumita in continuare &quot;Platforma&quot;) este un
              serviciu online de anunturi clasificate dedicat echipamentului de
              vanatoare. Platforma permite utilizatorilor sa publice si sa
              vizualizeze anunturi de vanzare, cumparare sau schimb de
              echipament.
            </p>
            <p>
              Platforma actioneaza exclusiv ca intermediar, punand la dispozitie
              spatiul de publicare a anunturilor.{" "}
              <strong className="text-[#EDEDED]">
                Lagoana nu este parte in nicio tranzactie
              </strong>{" "}
              intre utilizatori si nu garanteaza calitatea, legalitatea sau
              siguranta produselor listate.
            </p>
            <p>
              Tranzactiile se desfasoara direct intre utilizatori, pe propria lor
              raspundere. Platforma nu proceseaza plati si nu ofera servicii de
              escrow.
            </p>
          </div>
        </section>

        {/* 2. Cerinte pentru utilizatori */}
        <section className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-[#EDEDED] mb-4">
            2. Cerinte pentru utilizatori
          </h2>
          <div className="space-y-3 text-[#888] leading-relaxed">
            <p>
              Pentru a utiliza Platforma, trebuie sa indepliniti urmatoarele
              conditii:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Sa aveti varsta minima de{" "}
                <strong className="text-[#EDEDED]">18 ani</strong>.
              </li>
              <li>Sa furnizati informatii corecte si actualizate la inregistrare.</li>
              <li>
                Pentru anunturile care implica arme de foc sau munitie, sa
                detineti{" "}
                <strong className="text-[#EDEDED]">
                  documentele legale valabile
                </strong>{" "}
                (permis de arma, autorizatie de detinere/port arma conform Legii
                295/2004).
              </li>
              <li>
                Sa respectati legislatia romaneasca in vigoare privind detinerea,
                portul si comercializarea armelor si munitiilor.
              </li>
            </ul>
          </div>
        </section>

        {/* 3. Articole interzise */}
        <section className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-[#EDEDED] mb-4">
            3. Articole si activitati interzise
          </h2>
          <div className="space-y-3 text-[#888] leading-relaxed">
            <p>Este strict interzisa publicarea de anunturi care implica:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong className="text-[#EDEDED]">Bunuri furate</strong> sau
                obtinute prin mijloace ilegale.
              </li>
              <li>
                Arme sau munitie detinute fara documentele legale necesare.
              </li>
              <li>
                <strong className="text-[#EDEDED]">
                  Modificari ilegale
                </strong>{" "}
                ale armelor (amortizoare de sunet neautorizate, modificari ale
                mecanismului de tragere, conversii la foc automat etc.).
              </li>
              <li>Substante interzise, explozibili sau materiale pirotehnice.</li>
              <li>
                Orice articol a carui vanzare sau detinere este interzisa de
                legislatia romaneasca.
              </li>
              <li>
                Anunturi false, inselatoare sau care incalca drepturile altor
                persoane.
              </li>
            </ul>
            <p>
              Platforma isi rezerva dreptul de a sterge orice anunt care
              incalca acesti termeni si de a suspenda sau dezactiva contul
              utilizatorului.
            </p>
          </div>
        </section>

        {/* 4. Legislatia privind armele */}
        <section className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-[#EDEDED] mb-4">
            4. Legislatia privind armele de foc
          </h2>
          <div className="space-y-3 text-[#888] leading-relaxed">
            <p>
              Utilizatorii sunt obligati sa respecte prevederile{" "}
              <strong className="text-[#EDEDED]">
                Legii nr. 295/2004
              </strong>{" "}
              privind regimul armelor si al munitiilor, cu modificarile si
              completarile ulterioare, precum si orice alta legislatie aplicabila.
            </p>
            <p>
              Transferul dreptului de proprietate asupra armelor letale se
              realizeaza exclusiv prin intermediul armurerilor autorizati, conform
              legii. Platforma nu faciliteaza si nu autorizeaza transferuri
              directe de arme intre persoane fizice.
            </p>
            <p>
              Utilizatorii poarta intreaga responsabilitate pentru respectarea
              obligatiilor legale care le revin in calitate de detinatori sau
              comercianti de arme si munitii.
            </p>
          </div>
        </section>

        {/* 5. Limitarea raspunderii */}
        <section className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-[#EDEDED] mb-4">
            5. Limitarea raspunderii
          </h2>
          <div className="space-y-3 text-[#888] leading-relaxed">
            <p>Platforma Lagoana:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Nu garanteaza acuratetea, completitudinea sau legalitatea
                informatiilor din anunturi.
              </li>
              <li>
                Nu este responsabila pentru daunele directe sau indirecte
                rezultate din tranzactiile intre utilizatori.
              </li>
              <li>
                Nu ofera garantii privind disponibilitatea continua a serviciului.
              </li>
              <li>
                Isi rezerva dreptul de a modifica, suspenda sau intrerupe
                serviciul in orice moment, fara notificare prealabila.
              </li>
              <li>
                Nu este responsabila pentru continutul generat de utilizatori,
                inclusiv fotografii, descrieri sau mesaje.
              </li>
            </ul>
          </div>
        </section>

        {/* 6. GDPR */}
        <section className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-[#EDEDED] mb-4">
            6. Protectia datelor personale (GDPR)
          </h2>
          <div className="space-y-3 text-[#888] leading-relaxed">
            <p>
              Lagoana prelucreaza datele personale in conformitate cu
              Regulamentul General privind Protectia Datelor (GDPR - Regulamentul
              UE 2016/679) si legislatia romaneasca aplicabila.
            </p>
            <p>In calitate de utilizator, aveti urmatoarele drepturi:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong className="text-[#EDEDED]">Dreptul de acces</strong> -
                puteti solicita o copie a datelor personale pe care le detinem
                despre dumneavoastra.
              </li>
              <li>
                <strong className="text-[#EDEDED]">Dreptul la rectificare</strong>{" "}
                - puteti cere corectarea datelor incorecte sau incomplete.
              </li>
              <li>
                <strong className="text-[#EDEDED]">Dreptul la stergere</strong>{" "}
                (&quot;dreptul de a fi uitat&quot;) - puteti solicita stergerea
                datelor personale.
              </li>
              <li>
                <strong className="text-[#EDEDED]">
                  Dreptul la portabilitatea datelor
                </strong>{" "}
                - puteti primi datele intr-un format structurat, utilizat in mod
                curent.
              </li>
              <li>
                <strong className="text-[#EDEDED]">Dreptul la opozitie</strong> -
                va puteti opune prelucrarii datelor in anumite circumstante.
              </li>
            </ul>
            <p>
              Pentru exercitarea acestor drepturi, ne puteti contacta la adresa
              de email:{" "}
              <a
                href="mailto:contact@lagoana.ro"
                className="text-gold hover:underline"
              >
                contact@lagoana.ro
              </a>
              .
            </p>
          </div>
        </section>

        {/* 7. Modificari */}
        <section className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-[#EDEDED] mb-4">
            7. Modificarea termenilor
          </h2>
          <div className="space-y-3 text-[#888] leading-relaxed">
            <p>
              Lagoana isi rezerva dreptul de a modifica acesti Termeni si
              Conditii in orice moment. Modificarile intra in vigoare la data
              publicarii pe Platforma. Continuarea utilizarii Platformei dupa
              modificarea termenilor constituie acceptarea noilor conditii.
            </p>
            <p>
              Utilizatorii vor fi notificati prin email sau prin intermediul
              Platformei cu privire la modificarile semnificative ale termenilor.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
