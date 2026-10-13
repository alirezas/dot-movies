import { notFound } from "next/navigation";
import PersonPage from "@/app/person/[id]/_components/person-page";
import { getPerson, getPersonMovies } from "@/lib/queries/people";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const personId = Number(id);

  if (!Number.isInteger(personId)) {
    notFound();
  }

  const [person, credits] = await Promise.all([
    getPerson(personId),
    getPersonMovies(personId),
  ]);

  if (!person) {
    notFound();
  }

  return <PersonPage person={person} credits={credits} />;
}
