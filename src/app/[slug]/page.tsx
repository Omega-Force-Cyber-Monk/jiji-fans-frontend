import { notFound, redirect } from "next/navigation";
import { isReservedChannelSlug } from "@/lib/helpers/channelSlug";
import { apiUrl } from "@/config";

export const dynamic = "force-dynamic";

interface PublicChannelRouteProps {
	params: Promise<{
		slug: string;
	}>;
}

type ChannelLookupResponse = {
	data?: {
		_id?: string;
	};
};

export default async function PublicChannelRoute({
	params,
}: PublicChannelRouteProps) {
	const { slug } = await params;

	if (!slug || isReservedChannelSlug(slug)) {
		notFound();
	}

	const response = await fetch(`${apiUrl}${slug}`, {
		cache: "no-store",
		credentials: "omit",
	});

	if (!response.ok) {
		notFound();
	}

	const result = (await response.json()) as ChannelLookupResponse;
	const channelId = result?.data?._id;

	if (!channelId) {
		notFound();
	}

	redirect(`/overview/channels/${channelId}`);
}
