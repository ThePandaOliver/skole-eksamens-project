"use client";

import React from "react";
import PodcastForm, {PodcastFormProps} from "@/app/admin/PodcastForm";

export type PodcastCreateTabProps = PodcastFormProps;

export default function PodcastCreateTab(props: PodcastCreateTabProps) {
	return <PodcastForm {...props} />;
}
