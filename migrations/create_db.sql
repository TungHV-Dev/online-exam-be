create table users (
	User_Id 		serial			not null primary key,
	User_Name 		varchar(100) 	null,
	Password_Hash	text			null,
	Role_Id			int				null,
	Gender			varchar(10)		null,
	Address			text			null,
	Phone_Number	varchar(15)		null,
	Email			varchar(200)	null,
	Created_Time 	timestamp 		null,
	Updated_Time	timestamp		null,
	Is_Deleted		boolean			null
);

create table roles (
	Role_Id			serial			not null primary key,
	Role_Name		varchar(100)	null,
	Description		text			null,
	Is_Deleted		boolean			null
);

create table public.class (
	Class_Id		serial			not null primary key,
	Teacher_Id		int 			null,
	Class_Code		varchar(50)		null,
	Class_Name		varchar(2000)	null,
	Description		text			null,
	Created_Time 	timestamp 		null,
	Updated_Time	timestamp		null,
	Is_Deleted		boolean			null
);

create table class_document (
	Document_Id		serial			not null primary key,
	Class_Id 		int				null,
	File_Name		text			null,
	File_Path		text			null,
	Created_Time 	timestamp 		null,
	Updated_Time	timestamp		null,
	Is_Deleted		boolean			null
);

create table user_exam (
	Id				serial			not null primary key,
	User_Id 		int				null,
	Exam_Id			int 			null,
	Start_Time		timestamp		null,
	End_Time		timestamp		null,
	Score			decimal 		null,
	Created_Time 	timestamp 		null,
	Updated_Time	timestamp		null,
	Is_Deleted		boolean			null
);

create table exam (
	Exam_Id			serial			not null primary key,
	Class_Id		int				null,
	Exam_Name		varchar(1000)	null,
	Description		text			null,
	Total_Question	int				null,
	Total_Minutes	int				null,
	Is_Published	boolean			null,
	Created_Time 	timestamp 		null,
	Updated_Time	timestamp		null,
	Is_Deleted		boolean			null
);

create table user_exam_question (
	Id					serial			not null primary key,
	User_Exam_Id		int				null,
	Question_Id			int				null,
	Choosed_Result_Key	int				null
);

create table questions (
	Question_Id			serial			not null primary key,
	Exam_Id				int 			null,
	Question_Number		int				null,
	Question_Type		varchar(100)	null,
	Question_Content  	text			null,
	Created_Time 		timestamp 		null,
	Updated_Time		timestamp		null,
	Is_Deleted			boolean			null
);

create table results (
	Result_Id			serial			not null primary key,
	Question_Id			int				null,
	Result_Key			int				null,
	Result_Value		text			null,
	Is_Correct			boolean			null,
	Created_Time 		timestamp 		null,
	Updated_Time		timestamp		null,
	Is_Deleted			boolean			null
);
