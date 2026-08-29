import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const album = await prisma.album.upsert({
    where: { slug: "camino-de-servidumbre" },
    update: {},
    create: {
      title: "Camino de Servidumbre",
      slug: "camino-de-servidumbre",
      description:
        "Un réquiem para las mayorías invisibles que heredan el cansancio, entierran sus sueños y aun así sostienen el mundo.",
      manifesto:
        "Camino de servidumbre, el que caminó mi padre y en el que yo moriré. Cada vez que subo una cuesta entierro un sueño mío; entonces me despido de una parte de mí.",
      coverImage: "/branding/san-maldito-character.png",
      heroImage: "/branding/san-maldito-character.png",
      status: "production",
      featured: true,
      sortOrder: 1,
    },
  });

  const newsCount = await prisma.news.count();
  if (newsCount === 0) {
    await prisma.news.createMany({
      data: [
        {
          kind: "manifiesto",
          title: "El santo de los que nadie ve",
          excerpt: "San Maldito toma forma: una voz nacida del óxido, la deuda y la dignidad de quienes sostienen todo.",
          body: "Este espacio será el archivo vivo del proyecto: música, imágenes, textos y fechas sin intermediarios.",
          image: "/branding/brand-board.png",
          published: true,
        },
        {
          kind: "álbum",
          title: "Camino de Servidumbre",
          excerpt: "El primer álbum está en producción. Las canciones aparecerán aquí a medida que estén listas.",
          image: "/branding/san-maldito-character.png",
          published: true,
        },
      ],
    });
  }

  const settings = {
    heroEyebrow: "DEATH METAL · ARGENTINA",
    heroTitle: "Nadie sale santo de esta tierra.",
    heroSubtitle: "Un archivo de ruido, deuda y resistencia. La decadencia tiene un patrón. Nosotros le pusimos rostro.",
    heroImage: "/branding/san-maldito-character.png",
    aboutTitle: "Patrono de los olvidados",
    aboutText: "San Maldito no adora la decadencia: la expone. Es el espejo de un país que convierte el dolor en espectáculo y el sacrificio en costumbre.",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  console.log(`Seed listo: ${album.title}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
