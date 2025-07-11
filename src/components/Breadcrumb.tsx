import React from "react";
import {
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbSeparator,
	Breadcrumb as ShadBreadcrumb,
} from "@/components/ui/breadcrumb";

// A more flexible Breadcrumb component
const AppBreadcrumb = ({ children }: { children: React.ReactNode }) => (
	<ShadBreadcrumb className="mb-4">
		<BreadcrumbList>
			{React.Children.map(children, (child, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: <fuck you biome>
				<React.Fragment key={index}>
					{child}
					{index < React.Children.count(children) - 1 && (
						<BreadcrumbSeparator />
					)}
				</React.Fragment>
			))}
		</BreadcrumbList>
	</ShadBreadcrumb>
);

const Crumb = ({
	children,
	isCurrent,
}: {
	children: React.ReactNode;
	isCurrent?: boolean;
}) => (
	<BreadcrumbItem className={isCurrent ? "font-semibold text-foreground" : ""}>
		{children}
	</BreadcrumbItem>
);

AppBreadcrumb.Item = Crumb;

export default AppBreadcrumb;
