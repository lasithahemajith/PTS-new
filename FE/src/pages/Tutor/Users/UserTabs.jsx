import { useState } from "react";
import CreateUser from "./CreateUser";
import StudentsList from "./StudentsList";
import MentorsList from "./MentorsList";
import TutorsList from "./TutorsList";
import MappingTab from "./MappingTab";

export default function UserTabs() {
  const [activeTab, setActiveTab] = useState("create");

  const tabs = [
    { key: "create", label: "Create User" },
    { key: "students", label: "Students" },
    { key: "mentors", label: "Mentors" },
    { key: "tutors", label: "Tutors" },
    { key: "mapping", label: "Mentor–Student Mapping" },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "create": return <CreateUser />;
      case "students": return <StudentsList />;
      case "mentors": return <MentorsList />;
      case "tutors": return <TutorsList />;
      case "mapping": return <MappingTab />;
      default: return null;
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex overflow-x-auto border-b mb-6 gap-1 pb-px scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === tab.key
                ? "border-b-2 border-indigo-600 text-indigo-700"
                : "text-gray-500 hover:text-indigo-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{renderTab()}</div>
    </div>
  );
}
